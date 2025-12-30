"use server";

import prisma from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";

const LoginSchema = z.object({
    username: z.string().min(1, "Usuario requerido"),
    password: z.string().min(1, "Contraseña requerida"),
});

export async function loginAction(prevState: unknown, formData: FormData) {
    const result = LoginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return { error: "Datos inválidos" };
    }

    const { username, password } = result.data;

    try {
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return { error: "Credenciales incorrectas" };
        }

        // Create session
        const sessionData = {
            userId: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
        };

        const token = await encrypt(sessionData);

        const cookieStore = await cookies();
        cookieStore.set("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
            path: "/",
        });

        return { success: true };
    } catch (error) {
        console.error("Login Error:", error);
        return { error: "Error interno del servidor" };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

export async function getUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return null;

    try {
        return await decrypt(session);
    } catch (error) {
        return null;
    }
}
