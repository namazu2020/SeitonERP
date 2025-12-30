"use client";

import { useActionState, useEffect } from "react";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [state, action, isPending] = useActionState(loginAction, undefined);

    useEffect(() => {
        if (state?.success) {
            router.push("/");
        }
    }, [state, router]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-[#1D546D]/20 backdrop-blur-xl border border-[#1D546D]/30 p-8 rounded-3xl w-full max-w-md shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
                        Seiton<span className="text-[#75B9BE]">ERP</span>
                    </h1>
                    <p className="text-[#75B9BE] text-sm uppercase tracking-widest font-bold">Acceso al Sistema</p>
                </div>

                <form action={action} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase font-bold text-[#75B9BE] tracking-widest mb-2">
                            Usuario
                        </label>
                        <input
                            type="text"
                            name="username"
                            className="w-full bg-[#0F2936] border border-[#1D546D]/50 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#75B9BE] placeholder:text-slate-600"
                            placeholder="Ingrese su usuario..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase font-bold text-[#75B9BE] tracking-widest mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            className="w-full bg-[#0F2936] border border-[#1D546D]/50 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#75B9BE] placeholder:text-slate-600"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {state?.error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-medium text-center">
                            {state.error}
                        </div>
                    )}

                    <button
                        disabled={isPending}
                        type="submit"
                        className="w-full bg-[#75B9BE] hover:bg-[#5FA0A5] text-[#0B1E26] font-black uppercase tracking-widest py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isPending ? "Ingresando..." : "Ingresar"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500">
                        © 2025 Seiton Motors | Enterprise Resource Planning
                    </p>
                </div>
            </div>
        </div>
    );
}
