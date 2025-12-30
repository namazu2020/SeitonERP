"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getArgentinaDayBounds } from "@/utils/formatters";
import { getUser } from "@/app/actions/auth";

// Validation Schemas
const MovementSchema = z.object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.number().positive("El monto debe ser positivo"),
    description: z.string().min(1, "La descripción es requerida"),
    category: z.string().default("General")
});

const ClosingSchema = z.object({
    finalAmount: z.number().min(0, "El monto final debe ser mayor o igual a 0"),
    observations: z.string().optional()
});

/**
 * Fetches movements and session data.
 * Logic: Always show movements from the CURRENT active session (if any)
 * PLUS any movements that happened TODAY (calendar day).
 */
export async function getDailyMovements(dateInput?: Date) {
    try {
        const { start, end } = getArgentinaDayBounds(dateInput);

        const activeSession = await prisma.cashClosing.findFirst({
            where: { status: "OPEN" },
        });

        const lastSession = activeSession || await prisma.cashClosing.findFirst({
            orderBy: { openedAt: 'desc' }
        });

        // Query: Movements of current session OR movements of today
        const movements = await prisma.cashMovement.findMany({
            where: {
                OR: [
                    activeSession ? { closingId: activeSession.id } : {},
                    { createdAt: { gte: start, lte: end } }
                ].filter(condition => Object.keys(condition).length > 0)
            },
            orderBy: { createdAt: 'desc' },
            include: { sale: true }
        });

        // Totals reflect whatever is in the list (The visible "Ledger")
        let income = 0;
        let expense = 0;

        movements.forEach(m => {
            if (m.type === "INCOME") income += m.amount;
            else expense += m.amount;
        });

        return {
            movements,
            income,
            expense,
            lastSession
        };
    } catch (error) {
        console.error("Error in getDailyMovements:", error);
        throw new Error("No se pudieron cargar los movimientos de caja.");
    }
}

/**
 * Validates if the cash box is currently open.
 */
export async function isCashBoxOpen() {
    const openSession = await prisma.cashClosing.findFirst({
        where: { status: "OPEN" }
    });
    return !!openSession;
}

/**
 * Adds a manual movement (income/expense)
 * NO LONGER RESTRICTED to open box, as per User request.
 */
export async function addMovement(rawData: z.infer<typeof MovementSchema>) {
    try {
        const sessionUser = await getUser();
        if (!sessionUser) return { success: false, error: "No autorizado" };

        const validated = MovementSchema.parse(rawData);

        const openSession = await prisma.cashClosing.findFirst({
            where: { status: "OPEN" }
        });

        if (!openSession) {
            return { success: false, error: "La caja debe estar abierta para registrar movimientos." };
        }

        await prisma.cashMovement.create({
            data: {
                ...validated,
                userId: sessionUser.userId,
                closingId: openSession.id
            }
        });

        revalidatePath("/caja");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error adding movement:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error al registrar el movimiento." };
    }
}

/**
 * Updates an movement (Admin backdoor)
 */
export async function updateMovement(id: string, rawData: z.infer<typeof MovementSchema>) {
    const session = await getUser();
    if (!session || session.role !== "ADMIN") {
        return { success: false, error: "Permisos insuficientes." };
    }

    try {
        const validated = MovementSchema.parse(rawData);
        await prisma.cashMovement.update({
            where: { id },
            data: validated
        });
        revalidatePath("/caja");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al actualizar el movimiento." };
    }
}

/**
 * Deletes an movement (Admin backdoor)
 */
export async function deleteMovement(id: string) {
    const session = await getUser();
    if (!session || session.role !== "ADMIN") {
        return { success: false, error: "Permisos insuficientes." };
    }

    try {
        await prisma.cashMovement.delete({
            where: { id }
        });
        revalidatePath("/caja");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar el movimiento." };
    }
}

/**
 * Opens the cash box with an initial amount.
 */
export async function openCashBox(initialAmount: number) {
    if (initialAmount < 0) return { success: false, error: "El monto inicial no puede ser negativo." };

    try {
        const sessionUser = await getUser();
        if (!sessionUser) return { success: false, error: "No autorizado" };

        const result = await prisma.$transaction(async (tx) => {
            const openSession = await tx.cashClosing.findFirst({
                where: { status: "OPEN" }
            });

            if (openSession) {
                throw new Error(`Ya existe una caja abierta iniciada el ${openSession.openedAt.toLocaleString()}.`);
            }

            const now = new Date();

            const session = await tx.cashClosing.create({
                data: {
                    initialAmount,
                    status: "OPEN",
                    openedAt: now,
                    userId: sessionUser.userId,
                }
            });

            await tx.cashMovement.create({
                data: {
                    type: "INCOME",
                    amount: initialAmount,
                    description: "Apertura de Caja (Saldo Inicial)",
                    category: "Apertura",
                    userId: sessionUser.userId,
                    closingId: session.id,
                    createdAt: now
                }
            });

            return session;
        });

        revalidatePath("/caja");
        revalidatePath("/ventas");
        return { success: true, session: result };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Error al abrir la caja." };
    }
}

/**
 * Closes the active cash box with a user-defined final balance.
 */
export async function closeCashBox(rawData: z.infer<typeof ClosingSchema>) {
    try {
        const sessionUser = await getUser();
        if (!sessionUser) return { success: false, error: "No autorizado" };

        const validated = ClosingSchema.parse(rawData);
        const now = new Date();

        await prisma.$transaction(async (tx) => {
            const lastSession = await tx.cashClosing.findFirst({
                where: { status: "OPEN" },
                orderBy: { openedAt: 'desc' }
            });

            if (!lastSession) {
                throw new Error("No hay ninguna caja abierta para cerrar.");
            }

            // Reference calculations (for audit)
            const incomeAgg = await tx.cashMovement.aggregate({
                where: { closingId: lastSession.id, type: "INCOME" },
                _sum: { amount: true }
            });
            const expenseAgg = await tx.cashMovement.aggregate({
                where: { closingId: lastSession.id, type: "EXPENSE" },
                _sum: { amount: true }
            });

            await tx.cashClosing.update({
                where: { id: lastSession.id },
                data: {
                    totalIncome: incomeAgg._sum.amount || 0,
                    totalExpense: expenseAgg._sum.amount || 0,
                    finalAmount: validated.finalAmount,
                    status: "CLOSED",
                    closedAt: now,
                    observations: validated.observations,
                    userId: sessionUser.userId
                }
            });
        });

        revalidatePath("/caja");
        revalidatePath("/ventas");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error closing cash box:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error al cerrar la caja." };
    }
}
