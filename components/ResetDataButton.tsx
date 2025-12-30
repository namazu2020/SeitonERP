"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { resetDatabase } from "@/app/actions/config";

export default function ResetDataButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const handleReset = async () => {
        setIsLoading(true);
        try {
            const res = await resetDatabase();
            if (res.success) {
                alert("Base de datos reiniciada con éxito.");
                window.location.reload();
            } else {
                alert(res.error || "Error al reiniciar los datos.");
            }
        } catch (error) {
            alert("Error de conexión.");
        } finally {
            setIsLoading(false);
            setConfirming(false);
        }
    };

    if (!confirming) {
        return (
            <button
                onClick={() => setConfirming(true)}
                className="flex items-center gap-3 px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
            >
                <Trash2 className="h-4 w-4" /> Reiniciar Sistema (Full Wipe)
            </button>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-500 mb-2">
                <AlertTriangle className="h-6 w-6" />
                <h4 className="font-black uppercase tracking-widest text-sm">¿Estás absolutamente seguro?</h4>
            </div>
            <p className="text-xs text-red-400 font-medium leading-relaxed">
                Esta acción eliminará de forma permanente **todos** los productos, clientes, ventas, movimientos de caja y facturación. Esta operación NO se puede deshacer.
            </p>
            <div className="flex gap-3 mt-2">
                <button
                    disabled={isLoading}
                    onClick={handleReset}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 transition-all"
                >
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "SÍ, ELIMINAR TODO"}
                </button>
                <button
                    disabled={isLoading}
                    onClick={() => setConfirming(false)}
                    className="flex-1 px-6 py-3 bg-white/5 text-[#75B9BE] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                    CANCELAR
                </button>
            </div>
        </div>
    );
}
