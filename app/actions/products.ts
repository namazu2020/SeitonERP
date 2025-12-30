"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUser } from "@/app/actions/auth";

const ProductSchema = z.object({
    sku: z.string().min(1, "SKU es requerido"),
    name: z.string().min(1, "Nombre es requerido"),
    category: z.string().min(1, "Categoría es requerida"),
    priceList: z.number().min(0),
    stockActual: z.number().min(0),
    stockMin: z.number().min(0),
    location: z.string().optional(),
    compatibility: z.string().optional(),
});

export async function getProducts(query?: string) {
    return await prisma.product.findMany({
        where: query
            ? {
                OR: [
                    { name: { contains: query } },
                    { sku: { contains: query } },
                    { category: { contains: query } },
                ],
            }
            : undefined,
        orderBy: { createdAt: "desc" },
    });
}

export async function upsertProduct(id: string | undefined, data: z.infer<typeof ProductSchema>) {
    const session = await getUser();
    if (!session) return { success: false, error: "Acceso denegado" };

    try {
        const validated = ProductSchema.parse(data);

        if (id) {
            // UPDATE MODE
            const oldProduct = await prisma.product.findUnique({ where: { id } });
            if (!oldProduct) return { success: false, error: "Producto no encontrado" };

            const stockDiff = validated.stockActual - oldProduct.stockActual;

            if (session.role === "ADMIN") {
                await prisma.product.update({
                    where: { id },
                    data: validated,
                });
            } else {
                await prisma.product.update({
                    where: { id },
                    data: {
                        stockActual: validated.stockActual
                    },
                });
            }

            if (stockDiff !== 0) {
                await prisma.stockMovement.create({
                    data: {
                        productId: id,
                        userId: session.userId,
                        type: stockDiff > 0 ? "IN" : "OUT",
                        quantity: stockDiff,
                        reason: `Ajuste manual de stock (Carga/Edición)`,
                    }
                });
            }
        } else {
            // CREATE MODE
            const newProduct = await prisma.product.create({
                data: validated,
            });

            if (validated.stockActual > 0) {
                await prisma.stockMovement.create({
                    data: {
                        productId: newProduct.id,
                        userId: session.userId,
                        type: "IN",
                        quantity: validated.stockActual,
                        reason: `Carga inicial de producto`,
                    }
                });
            }
        }

        revalidatePath("/stock");
        return { success: true };
    } catch (error: any) {
        console.error("Error in upsertProduct:", error);
        return { success: false, error: error.message || "Error al guardar el producto" };
    }
}

export async function deleteProduct(id: string) {
    const session = await getUser();
    if (!session || session.role !== "ADMIN") {
        return { success: false, error: "Permisos insuficientes para eliminar productos." };
    }

    try {
        await prisma.product.delete({
            where: { id },
        });
        revalidatePath("/stock");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar producto. Puede tener movimientos asociados." };
    }
}
