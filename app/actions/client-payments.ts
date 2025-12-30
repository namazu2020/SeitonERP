"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUser } from "./auth";
import { getArgentinaDate } from "@/utils/formatters";

const PaymentSchema = z.object({
    clientId: z.string(),
    amount: z.number().positive("El monto debe ser positivo"),
    description: z.string().optional(),
});

/**
 * Registers a payment from a client.
 * Atomic transaction to update balance, record transaction and cash movement.
 */
export async function registerClientPayment(data: z.infer<typeof PaymentSchema>) {
    try {
        const sessionUser = await getUser();
        if (!sessionUser) return { success: false, error: "No autorizado" };

        const validated = PaymentSchema.parse(data);

        // Block payments if cash box is closed
        const openSession = await prisma.cashClosing.findFirst({
            where: { status: "OPEN" }
        });

        if (!openSession) {
            return { success: false, error: "La caja está cerrada. Debe abrirla para registrar pagos." };
        }

        const now = getArgentinaDate();

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Cash Movement (Money entering the business)
            const movement = await tx.cashMovement.create({
                data: {
                    type: "INCOME",
                    amount: validated.amount,
                    description: validated.description || `Pago Cta. Cte. Cliente`,
                    category: "Cobro Cuenta Corriente",
                    userId: sessionUser.userId,
                    closingId: openSession.id,
                    createdAt: now
                },
            });

            // 2. Decrement Client Balance
            const client = await tx.client.update({
                where: { id: validated.clientId },
                data: {
                    currentAccountBalance: { decrement: validated.amount },
                },
            });

            // 3. Record Client Transaction (History)
            await tx.clientTransaction.create({
                data: {
                    clientId: validated.clientId,
                    userId: sessionUser.userId,
                    type: "PAYMENT",
                    amount: -validated.amount, // Negative because it reduces debt
                    description: validated.description || `Pago a cuenta`,
                    createdAt: now
                },
            });

            return { movement, client };
        });

        revalidatePath("/clientes");
        revalidatePath("/caja");
        return { success: true, data: result };
    } catch (error: unknown) {
        console.error("Payment registration failed:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error al registrar el pago." };
    }
}
