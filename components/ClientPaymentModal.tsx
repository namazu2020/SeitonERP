"use client";

import { useState } from "react";
import { X, CheckCircle2, DollarSign } from "lucide-react";
import { registerClientPayment } from "@/app/actions/client-payments";
import { formatCurrencyARS } from "@/utils/formatters";

import { Client } from "@prisma/client";

interface ClientPaymentModalProps {
    client: Client;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ClientPaymentModal({ client, isOpen, onClose, onSuccess }: ClientPaymentModalProps) {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        const res = await registerClientPayment({
            clientId: client.id,
            amount: parseFloat(amount),
            description: description || undefined,
        });

        setIsProcessing(false);

        if (res.success) {
            onSuccess();
            onClose();
        } else {
            alert("Error al registrar pago: " + res.error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#04141C] p-8 rounded-3xl border border-[#1D546D]/30 shadow-2xl w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#75B9BE] hover:text-[#FFFFFF] transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="flex flex-col items-center mb-6">
                    <div className="h-14 w-14 bg-[#75B9BE]/10 rounded-full flex items-center justify-center mb-4 border border-[#75B9BE]/20">
                        <DollarSign className="h-7 w-7 text-[#75B9BE]" />
                    </div>
                    <h2 className="text-2xl font-black text-[#FFFFFF] uppercase tracking-wide">Registrar Pago</h2>
                    <p className="text-[#75B9BE]/60 text-sm font-bold uppercase tracking-widest mt-1">
                        {client.name}
                    </p>
                </div>

                <div className="bg-[#0A2633] p-4 rounded-xl mb-6 border border-[#1D546D]/30 text-center">
                    <p className="text-[#75B9BE]/70 text-xs font-bold uppercase tracking-widest">Saldo Actual</p>
                    <p className={`text-2xl font-black ${client.currentAccountBalance > 0 ? "text-red-400" : "text-[#75B9BE]"}`}>
                        {formatCurrencyARS(client.currentAccountBalance || 0)}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-[#75B9BE] uppercase tracking-widest mb-2">Monto ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            min="0.01"
                            className="w-full bg-[#0A2633] border border-[#1D546D]/30 rounded-xl p-4 text-[#FFFFFF] outline-none focus:border-[#75B9BE] transition-all font-bold text-lg"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#75B9BE] uppercase tracking-widest mb-2">Descripción (Opcional)</label>
                        <input
                            type="text"
                            className="w-full bg-[#0A2633] border border-[#1D546D]/30 rounded-xl p-4 text-[#FFFFFF] outline-none focus:border-[#75B9BE] transition-all"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ej: Pago parcial, Cancelación total..."
                        />
                    </div>

                    {!isOpen && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-2 flex items-center gap-3 animate-pulse">
                            <span className="text-red-400 text-xs font-black uppercase tracking-tighter">Caja Cerrada - No se pueden recibir pagos</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isProcessing || !isOpen}
                        className={`w-full p-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-4 shadow-lg ${!isOpen ? "bg-gray-500/20 text-gray-500 cursor-not-allowed" : "bg-[#75B9BE] text-[#061E29] hover:bg-[#FFFFFF] shadow-[#75B9BE]/10"}`}
                    >
                        {isProcessing ? "Procesando..." : !isOpen ? "Caja Cerrada" : (
                            <>
                                <CheckCircle2 className="h-5 w-5" /> Confirmar Pago
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div >
    );
}
