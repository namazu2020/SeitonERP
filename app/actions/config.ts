"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "@/app/actions/auth";

export async function getVehicleDatabase() {
    try {
        const config = await prisma.config.findUnique({
            where: { id: "default" },
            select: { vehicleDatabase: true }
        });

        if (config?.vehicleDatabase) {
            return JSON.parse(config.vehicleDatabase) as Record<string, string[]>;
        }
        return null;
    } catch (error) {
        console.error("Error fetching vehicle database:", error);
        return null;
    }
}

export async function updateVehicleDatabase(vehicleData: Record<string, string[]>) {
    const session = await getUser();
    if (!session || session.role !== "ADMIN") {
        return { success: false, error: "Permisos insuficientes." };
    }

    try {
        await prisma.config.upsert({
            where: { id: "default" },
            update: { vehicleDatabase: JSON.stringify(vehicleData) },
            create: {
                id: "default",
                vehicleDatabase: JSON.stringify(vehicleData)
            }
        });
        revalidatePath("/stock"); // Revalidate stock page where form might be used
        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating vehicle database:", error);
        return { success: false, error: "Error updating database" };
    }
}

export async function getCategories() {
    try {
        const config = await prisma.config.findUnique({
            where: { id: "default" },
            select: { categories: true }
        });

        if (config?.categories) {
            return JSON.parse(config.categories) as string[];
        }
        return null;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return null;
    }
}

export async function updateCategories(categories: string[]) {
    const session = await getUser();
    if (!session || session.role !== "ADMIN") {
        return { success: false, error: "Permisos insuficientes." };
    }

    try {
        await prisma.config.upsert({
            where: { id: "default" },
            update: { categories: JSON.stringify(categories) },
            create: {
                id: "default",
                categories: JSON.stringify(categories)
            }
        });
        revalidatePath("/stock");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating categories:", error);
        return { success: false, error: "Error updating categories" };
    }
}

export async function resetDatabase() {
    const session = await getUser();
    if (!session || session.role !== "ADMIN") {
        return { success: false, error: "Permisos insuficientes. Solo administradores pueden reiniciar el sistema." };
    }

    try {
        await prisma.$transaction([
            prisma.saleItem.deleteMany(),
            prisma.sale.deleteMany(),
            prisma.stockMovement.deleteMany(),
            prisma.clientTransaction.deleteMany(),
            prisma.cashMovement.deleteMany(),
            prisma.cashClosing.deleteMany(),
            prisma.product.deleteMany(),
            prisma.client.deleteMany(),
        ]);

        revalidatePath("/");
        revalidatePath("/ventas");
        revalidatePath("/stock");
        revalidatePath("/clientes");
        revalidatePath("/caja");
        revalidatePath("/reportes");
        revalidatePath("/configuracion");

        return { success: true };
    } catch (error) {
        console.error("Error resetting database:", error);
        return { success: false, error: "Error crítico al intentar reiniciar la base de datos." };
    }
}
