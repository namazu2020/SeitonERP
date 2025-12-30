"use server";

import prisma from "@/lib/prisma";

export async function getSalesHistory(query?: string) {
    try {
        const sales = await prisma.sale.findMany({
            where: query ? {
                OR: [
                    { invoiceNumber: { contains: query } },
                    { client: { name: { contains: query } } }
                ]
            } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                client: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        return sales;
    } catch (error) {
        console.error("Error fetching sales history:", error);
        return [];
    }
}

export async function getSaleDetail(id: string) {
    try {
        const sale = await prisma.sale.findUnique({
            where: { id },
            include: {
                client: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        return sale;
    } catch (error) {
        console.error("Error fetching sale detail:", error);
        return null;
    }
}

export async function getInvoiceConfig() {
    try {
        const config = await prisma.config.findUnique({
            where: { id: "default" }
        });
        return config;
    } catch (error) {
        console.error("Error fetching invoice config:", error);
        return null;
    }
}
