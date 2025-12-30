"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUser } from "@/app/actions/auth";
import { Prisma } from "@prisma/client";

const ClientSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    taxId: z.string().min(1, "CUIT/DNI es requerido"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    taxCondition: z.string().min(1, "Condición fiscal es requerida"),
    currentAccountEnabled: z.boolean().default(false),
    // currentAccountBalance is managed separately or defaults to 0
});

export async function getClients(query?: string) {
    return await prisma.client.findMany({
        where: query ? {
            OR: [
                { name: { contains: query } },
                { taxId: { contains: query } },
                { email: { contains: query } }
            ]
        } : undefined,
        orderBy: { updatedAt: 'desc' },
        include: {
            _count: {
                select: { sales: true }
            }
        }
    });
}

export async function upsertClient(id: string | undefined, data: z.infer<typeof ClientSchema>) {
    const validated = ClientSchema.parse(data);

    try {
        if (id) {
            const session = await getUser();
            if (!session || session.role !== "ADMIN") {
                return { success: false, error: "Permisos insuficientes. Empleados no pueden editar clientes." };
            }

            await prisma.client.update({
                where: { id },
                data: validated
            });
        } else {
            await prisma.client.create({
                data: validated
            });
        }
        revalidatePath("/clientes");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error upserting client:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { success: false, error: "Ya existe un cliente con este CUIT/DNI." };
        }
        return { success: false, error: "Error al guardar el cliente." };
    }
}

export async function deleteClient(id: string) {
    const session = await getUser();
    if (!session || session.role !== "ADMIN") {
        return { success: false, error: "Permisos insuficientes." };
    }

    try {
        await prisma.client.delete({ where: { id } });
        revalidatePath("/clientes");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Cannot delete client with sales history" };
    }
}

export async function getClientHistory(clientId: string) {
    return await prisma.clientTransaction.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
    });
}
