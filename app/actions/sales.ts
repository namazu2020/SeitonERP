"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isCashBoxOpen } from "./cash";
import { getUser } from "./auth";
import { getArgentinaDate, round } from "@/utils/formatters";

const SaleItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().positive(),
});

const SaleSchema = z.object({
    clientId: z.string().optional(),
    items: z.array(SaleItemSchema).nonempty(),
    paymentMethod: z.string().default("Efectivo"),
    invoiceType: z.enum(["A", "B", "C"]).default("B"),
    useCredit: z.boolean().default(true), // New flag to control credit usage
});

export async function createSale(data: z.infer<typeof SaleSchema>) {
    const session = await getUser();
    if (!session) return { success: false, error: "No autorizado" };

    const validated = SaleSchema.parse(data);

    // Block sales if cash box is closed (only for methods that impact cash)
    if (validated.paymentMethod !== "Cuenta Corriente") {
        const isOpen = await isCashBoxOpen();
        if (!isOpen) {
            return { success: false, error: "La caja está cerrada. Debe abrirla para realizar ventas." };
        }
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            let subtotal = 0;
            let taxAmount = 0;
            const saleItemsData = [];

            for (const item of validated.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    throw new Error(`Producto con ID ${item.productId} no encontrado`);
                }

                if (product.stockActual < item.quantity) {
                    throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stockActual}`);
                }

                // Calculate prices
                const itemPrice = product.priceList;
                const itemTax = round((itemPrice * product.ivaRate) / 100);
                const itemTotal = round((itemPrice + itemTax) * item.quantity);

                subtotal += round(itemPrice * item.quantity);
                taxAmount += round(itemTax * item.quantity);

                saleItemsData.push({
                    productId: product.id,
                    sku: product.sku,
                    name: product.name,
                    quantity: item.quantity,
                    priceAtSale: itemPrice,
                    taxRateAtSale: product.ivaRate,
                    totalAtSale: itemTotal,
                });

                // Update Stock
                await tx.product.update({
                    where: { id: product.id },
                    data: {
                        stockActual: {
                            decrement: item.quantity,
                        },
                    },
                });

                // Record Stock Movement
                await tx.stockMovement.create({
                    data: {
                        productId: product.id,
                        userId: session.userId,
                        type: "OUT",
                        quantity: -item.quantity,
                        reason: `Venta - Item de factura`,
                    }
                });
            }

            const total = round(subtotal + taxAmount);

            // Let's determine Invoice Type and Client early
            let invoiceType: "A" | "B" | "C" = "B";
            let clientData = null;

            if (validated.clientId) {
                clientData = await tx.client.findUnique({
                    where: { id: validated.clientId }
                });

                if (clientData?.taxCondition === "Responsable Inscripto") {
                    invoiceType = "A";
                } else if (clientData?.taxCondition === "Monotributista" || clientData?.taxCondition === "Exento") {
                    invoiceType = "B";
                }
            }

            // Generate invoice number
            const latestSale = await tx.sale.findFirst({
                where: { invoiceType },
                orderBy: { createdAt: 'desc' }
            });

            let sequence = 1;
            if (latestSale) {
                const parts = latestSale.invoiceNumber.split("-");
                sequence = parseInt(parts[parts.length - 1]) + 1;
            }

            const invoiceNumber = `${invoiceType}-0001-${sequence.toString().padStart(8, "0")}`;

            const now = getArgentinaDate();

            // Create Sale
            const sale = await tx.sale.create({
                data: {
                    invoiceNumber,
                    invoiceType,
                    clientId: validated.clientId,
                    userId: session.userId,
                    subtotal,
                    taxAmount,
                    total,
                    paymentMethod: validated.paymentMethod,
                    createdAt: now,
                    items: {
                        create: saleItemsData,
                    },
                },
                include: {
                    items: true,
                    client: true,
                },
            });

            let remainingToPay = total;
            let usedCredit = 0;

            // 5. Handle "Saldo a Favor" (Credit Balance) logic
            if (validated.clientId && clientData && validated.useCredit) {
                const currentBalance = clientData.currentAccountBalance;

                // If balance is negative, client has credit "a favor"
                if (currentBalance < 0) {
                    const availableCredit = Math.abs(currentBalance);
                    usedCredit = round(Math.min(availableCredit, total));
                    remainingToPay = round(total - usedCredit);

                    if (usedCredit > 0) {
                        // Consume credit: Increment balance (move towards 0)
                        await tx.client.update({
                            where: { id: validated.clientId },
                            data: {
                                currentAccountBalance: { increment: usedCredit },
                            },
                        });

                        // Record credit usage
                        await tx.clientTransaction.create({
                            data: {
                                clientId: validated.clientId,
                                userId: session.userId,
                                type: "CREDIT_USAGE",
                                amount: usedCredit, // + adds to balance (reduces credit)
                                description: `Uso de saldo a favor - ${invoiceNumber}`,
                                saleId: sale.id, // We'll link it after sale creation if needed, but we can do it here if sale is created first
                                createdAt: now,
                            },
                        });
                    }
                }
            }

            // 6. Handle Payment Method for the REMAINING balance
            if (validated.paymentMethod === "Cuenta Corriente") {
                if (!validated.clientId) {
                    throw new Error("Se requiere un cliente registrado para Cuenta Corriente");
                }

                if (!clientData?.currentAccountEnabled) {
                    throw new Error("El cliente seleccionado no tiene habilitada la Cuenta Corriente");
                }

                if (remainingToPay > 0) {
                    // Update Client Balance with the part NOT covered by credit
                    await tx.client.update({
                        where: { id: validated.clientId },
                        data: {
                            currentAccountBalance: { increment: remainingToPay },
                        },
                    });

                    // Record Transaction
                    await tx.clientTransaction.create({
                        data: {
                            clientId: validated.clientId,
                            userId: session.userId,
                            type: "SALE",
                            amount: remainingToPay,
                            description: `Compra en Cte. Cte. - ${invoiceNumber}`,
                            saleId: sale.id,
                            createdAt: now,
                        },
                    });
                }
            } else {
                // Find open session for cash linkage
                const openSession = await tx.cashClosing.findFirst({
                    where: { status: "OPEN" }
                });

                if (remainingToPay > 0) {
                    // Create Cash Movement only for the part NOT covered by credit
                    await tx.cashMovement.create({
                        data: {
                            type: "INCOME",
                            amount: remainingToPay,
                            description: `Venta ${invoiceNumber} (Efectivo)${usedCredit > 0 ? ` - Descontado ${usedCredit} de saldo a favor` : ""}`,
                            category: "Venta",
                            userId: session.userId,
                            closingId: openSession?.id,
                            createdAt: now,
                            sale: {
                                connect: { id: sale.id },
                            },
                        },
                    });
                }
            }

            return sale;
        });

        revalidatePath("/ventas");
        revalidatePath("/stock");
        return { success: true, sale: result };
    } catch (error: unknown) {
        console.error("Sale transaction failed:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido en la venta" };
    }
}
