"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "@/app/actions/auth";
import { round } from "@/utils/formatters";

interface MappedProduct {
    sku: string;
    name?: string;
    category?: string;
    priceList?: number;
    purchasePrice?: number;
    stockActual?: number;
    stockMin?: number;
    location?: string;
    brand?: string;
    factoryCode?: string;
    supplier?: string;
}

export async function importProductsBulk(products: MappedProduct[]) {
    const session = await getUser();
    if (!session || session.role !== "ADMIN") {
        return { success: false, error: "Permisos insuficientes." };
    }

    if (!products || products.length === 0) {
        return { success: false, error: "No hay productos para importar." };
    }

    let created = 0;
    let updated = 0;
    let errors = 0;

    try {
        // Process in chunks to avoid timeout or db overload
        const chunkSize = 50;
        for (let i = 0; i < products.length; i += chunkSize) {
            const chunk = products.slice(i, i + chunkSize);

            await Promise.all(chunk.map(async (p) => {
                try {
                    // Check if exists
                    const existing = await prisma.product.findUnique({
                        where: { sku: p.sku }
                    });

                    if (existing) {
                        // PARTIAL UPDATE: Only update fields that are provided
                        await prisma.product.update({
                            where: { id: existing.id },
                            data: {
                                name: p.name || undefined,
                                category: p.category || undefined,
                                priceList: p.priceList !== undefined ? p.priceList : undefined,
                                purchasePrice: p.purchasePrice !== undefined ? p.purchasePrice : undefined,
                                stockActual: p.stockActual !== undefined ? p.stockActual : undefined,
                                stockMin: p.stockMin !== undefined ? p.stockMin : undefined,
                                location: p.location || undefined,
                                brand: p.brand || undefined,
                                factoryCode: p.factoryCode || undefined,
                                supplier: p.supplier || undefined
                            }
                        });
                        updated++;
                    } else {
                        // CREATE: Use defaults for missing fields
                        const newP = await prisma.product.create({
                            data: {
                                sku: p.sku,
                                name: p.name || "Producto Nuevo",
                                category: p.category || "General",
                                priceList: p.priceList || 0,
                                purchasePrice: p.purchasePrice || 0,
                                stockActual: p.stockActual || 0,
                                stockMin: p.stockMin || 0,
                                location: p.location,
                                brand: p.brand,
                                factoryCode: p.factoryCode,
                                supplier: p.supplier
                            }
                        });

                        // Initial stock movement
                        if (p.stockActual && p.stockActual > 0) {
                            await prisma.stockMovement.create({
                                data: {
                                    productId: newP.id,
                                    userId: session.userId,
                                    type: "IN",
                                    quantity: p.stockActual,
                                    reason: "Importación masiva inicial"
                                }
                            });
                        }
                        created++;
                    }
                } catch (e) {
                    console.error(`Error importing product SKU ${p.sku}:`, e);
                    errors++;
                }
            }));
        }

        revalidatePath("/stock");
        revalidatePath("/reportes");

        return {
            success: true,
            summary: { created, updated, errors }
        };
    } catch (error) {
        console.error("Critical error in bulk import:", error);
        return { success: false, error: "Error crítico durante la importación." };
    }
}
