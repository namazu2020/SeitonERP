"use client";

import { User, CheckCircle2, FileDown, Plus } from "lucide-react";
import { Client, Config } from "@prisma/client";
import { formatCurrencyARS } from "@/utils/formatters";
import { generateInvoicePDF } from "@/utils/invoiceGenerator";

interface POSCheckoutPanelProps {
    clients: Client[];
    selectedClientId: string;
    setSelectedClientId: (id: string) => void;
    paymentMethod: "Efectivo" | "Cuenta Corriente";
    setPaymentMethod: (method: "Efectivo" | "Cuenta Corriente") => void;
    subtotal: number;
    totalIva: number;
    total: number;
    isProcessing: boolean;
    isCashBoxOpen: boolean;
    handleCheckout: () => void;
    cartLength: number;
    lastSale: any;
    config: Config | null;
}

export default function POSCheckoutPanel({
    clients,
    selectedClientId,
    setSelectedClientId,
    paymentMethod,
    setPaymentMethod,
    subtotal,
    totalIva,
    total,
    useCredit,
    setUseCredit,
    isProcessing,
    isCashBoxOpen,
    handleCheckout,
    cartLength,
    lastSale,
    config
}: POSCheckoutPanelProps & { useCredit: boolean; setUseCredit: (v: boolean) => void }) {
    const selectedClient = clients.find(c => c.id === selectedClientId);
    const creditAvailable = selectedClient && selectedClient.currentAccountBalance < 0
        ? Math.abs(selectedClient.currentAccountBalance)
        : 0;

    const usedCredit = useCredit ? Math.min(creditAvailable, total) : 0;
    const finalTotal = total - usedCredit;

    return (
        <div className="lg:col-span-4 space-y-6 sticky top-8">
            <div className="premium-card p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#75B9BE] to-transparent opacity-50" />
                <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <User className="h-5 w-5 text-[#75B9BE]" /> Datos del Cliente
                </h2>
                <div className="relative group/select">
                    <select
                        className="w-full p-4 bg-[#0A2633] text-[#FFFFFF] rounded-2xl outline-none border border-[#1D546D]/30 focus:border-[#75B9BE] transition-all appearance-none cursor-pointer font-medium"
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                    >
                        <option value="">Consumidor Final</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.taxId})</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#75B9BE]">
                        <Plus className="h-4 w-4 rotate-45" />
                    </div>
                </div>

                {/* Saldo a Favor Alert/Toggle */}
                {creditAvailable > 0 && (
                    <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Saldo a Favor Detectado</span>
                            <span className="text-sm font-black text-emerald-400">{formatCurrencyARS(creditAvailable)}</span>
                        </div>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-[#FFFFFF]/70 group-hover:text-white transition-colors">¿Usar para esta compra?</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={useCredit}
                                    onChange={(e) => setUseCredit(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-[#0A2633] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white"></div>
                            </div>
                        </label>
                    </div>
                )}
            </div>

            <div className="premium-card p-8 rounded-[2.5rem] bg-linear-to-b from-[#0A2633] to-[#061E29]">
                <h2 className="text-2xl font-black mb-6 border-b border-[#1D546D]/20 pb-4">Checkout</h2>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-[#75B9BE] uppercase tracking-widest mb-3">Método de Pago</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setPaymentMethod("Efectivo")}
                            className={`p-4 rounded-xl border font-bold text-sm transition-all ${paymentMethod === "Efectivo" ? "bg-[#75B9BE] text-[#061E29] border-[#75B9BE] shadow-[0_0_20px_rgba(117,185,190,0.3)]" : "bg-[#0A2633] text-[#FFFFFF]/50 border-[#1D546D]/30 hover:border-[#75B9BE]/50"}`}
                        >
                            Efectivo
                        </button>
                        {(() => {
                            const isEnabled = selectedClient?.currentAccountEnabled;

                            return (
                                <button
                                    onClick={() => {
                                        if (isEnabled) {
                                            setPaymentMethod("Cuenta Corriente");
                                        } else {
                                            alert("Este cliente no tiene habilitada la Cuenta Corriente. Puede habilitarla desde el módulo de Clientes.");
                                        }
                                    }}
                                    className={`p-4 rounded-xl border font-bold text-sm transition-all ${paymentMethod === "Cuenta Corriente" ? "bg-[#75B9BE] text-[#061E29] border-[#75B9BE] shadow-[0_0_20px_rgba(117,185,190,0.3)]" : "bg-[#0A2633] text-[#FFFFFF]/50 border-[#1D546D]/30 hover:border-[#75B9BE]/50"} ${!isEnabled ? "opacity-50 grayscale-[0.5]" : ""}`}
                                >
                                    <div className="relative">
                                        Cta. Corriente
                                        {!isEnabled && selectedClientId && (
                                            <div className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        )}
                                    </div>
                                </button>
                            );
                        })()}
                    </div>
                </div>
                <div className="space-y-5 text-base">
                    <div className="flex justify-between items-center text-[#75B9BE]">
                        <span className="font-medium">Subtotal Neto</span>
                        <span className="font-bold text-[#FFFFFF] text-lg">{formatCurrencyARS(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#75B9BE]">
                        <span className="font-medium">Impuestos (21%)</span>
                        <span className="font-bold text-[#FFFFFF] text-lg">{formatCurrencyARS(totalIva)}</span>
                    </div>

                    {usedCredit > 0 && (
                        <div className="flex justify-between items-center text-emerald-400 animate-in fade-in zoom-in-95">
                            <span className="font-black text-[10px] uppercase tracking-widest">Saldo a Favor aplicado</span>
                            <span className="font-bold text-lg">-{formatCurrencyARS(usedCredit)}</span>
                        </div>
                    )}

                    <div className="py-4">
                        <div className="h-px bg-linear-to-r from-transparent via-[#1D546D]/50 to-transparent" />
                    </div>
                    <div className="flex justify-between items-center bg-[#1D546D]/10 p-5 rounded-2xl border border-[#1D546D]/30">
                        <span className="text-xl font-black text-[#FFFFFF]">TOTAL PAGAR</span>
                        <span className="text-3xl font-black text-[#75B9BE] tracking-tighter">{formatCurrencyARS(finalTotal)}</span>
                    </div>
                </div>

                <button
                    disabled={cartLength === 0 || isProcessing || !isCashBoxOpen}
                    onClick={handleCheckout}
                    className={`w-full mt-10 py-5 text-[#FFFFFF] rounded-2xl font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-4 relative overflow-hidden group/btn ${(!isCashBoxOpen) ? "bg-gray-500/20 grayscale cursor-not-allowed opacity-50" : "bg-[#1D546D] shadow-[#1D546D]/20 hover:bg-[#75B9BE] hover:text-[#061E29] hover:-translate-y-1 active:scale-[0.98]"}`}
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    {isProcessing ? "Procesando operación..." : !isCashBoxOpen ? "Caja Cerrada" : (
                        <>
                            <CheckCircle2 className="h-6 w-6" />
                            <span className="uppercase">Completar Venta</span>
                        </>
                    )}
                </button>

                <p className="text-center mt-6 text-[10px] text-[#75B9BE]/50 uppercase tracking-[0.2em] font-bold">
                    Sistema de Facturación Certificado
                </p>
            </div>

            {lastSale && (
                <div className="premium-card p-6 rounded-3xl border-[#75B9BE]/40 bg-[#75B9BE]/5 animate-in zoom-in-95 duration-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <CheckCircle2 className="h-20 w-20 text-[#75B9BE]" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="bg-[#75B9BE] p-3 rounded-full text-[#04141C]">
                            <FileDown className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-black text-[#75B9BE] text-xl">Operación éxitosa</h3>
                            <p className="text-xs text-[#FFFFFF]/60 font-mono mt-1">{lastSale.invoiceNumber}</p>
                        </div>
                        <button
                            onClick={() => generateInvoicePDF(lastSale, config)}
                            className="w-full flex items-center justify-center gap-3 p-4 bg-[#FFFFFF] text-[#04141C] rounded-2xl hover:bg-[#75B9BE] transition-all font-black text-sm uppercase tracking-widest shadow-lg shadow-white/5"
                        >
                            Descargar Factura
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
