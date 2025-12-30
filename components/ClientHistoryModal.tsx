"use client";

import { useState, useEffect } from "react";
import { X, History, ArrowUpRight, ArrowDownLeft, FileText } from "lucide-react";
import { getClientHistory } from "@/app/actions/clients";
import { ClientTransaction } from "@prisma/client";
import { formatCurrencyARS, formatDate } from "@/utils/formatters";

interface ClientHistoryModalProps {
    client: any;
    onClose: () => void;
}

export default function ClientHistoryModal({ client, onClose }: ClientHistoryModalProps) {
    const [transactions, setTransactions] = useState<ClientTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const data = await getClientHistory(client.id);
            // Calculate running balance
            // We need to work from oldest to newest to calculate cumulative balance correctly
            let balance = 0;
            const sortedData = [...data].sort((a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            const historyWithBalance = sortedData.map(tx => {
                if (tx.type === "SALE") {
                    balance += tx.amount;
                } else {
                    balance -= tx.amount;
                }
                return { ...tx, runningBalance: balance };
            });

            // Set back to descending order for display
            setTransactions(historyWithBalance.reverse() as any);
            setLoading(false);
        };
        fetchHistory();
    }, [client.id]);

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="premium-card rounded-3xl w-full max-w-4xl flex flex-col h-[80vh] overflow-hidden shadow-2xl animate-in zoom-in-95">
                <div className="bg-[#061E29] flex flex-col h-full rounded-[calc(1.5rem-2px)]">

                    {/* Header */}
                    <div className="flex-none px-8 py-6 border-b border-[#1D546D]/20 flex justify-between items-center bg-[#061E29]">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#1D546D]/20 p-3 rounded-2xl">
                                <History className="h-6 w-6 text-[#75B9BE]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#FFFFFF] tracking-tight uppercase">
                                    Historial de <span className="text-[#75B9BE]">Movimientos</span>
                                </h2>
                                <p className="text-[#75B9BE] text-xs font-bold uppercase tracking-widest opacity-60">
                                    {client.name} • Saldo: {formatCurrencyARS(client.currentAccountBalance)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-[#75B9BE] hover:text-[#FFFFFF] transition-colors bg-[#0A2633] rounded-xl hover:bg-[#1D546D]"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-[#75B9BE]">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#75B9BE] mb-4"></div>
                                <p className="font-bold uppercase tracking-widest text-xs">Cargando movimientos...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-[#75B9BE]/40">
                                <FileText className="h-16 w-16 mb-4 opacity-20" />
                                <p className="font-bold uppercase tracking-widest text-sm">Sin movimientos registrados</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-12 px-6 py-2 text-[10px] font-black text-[#75B9BE] uppercase tracking-[0.2em]">
                                    <div className="col-span-3">Fecha</div>
                                    <div className="col-span-5">Concepto</div>
                                    <div className="col-span-2 text-right">Monto</div>
                                    <div className="col-span-2 text-right">Balance</div>
                                </div>
                                <div className="space-y-3">
                                    {transactions.map((tx: any) => {
                                        const isSale = tx.type === "SALE";
                                        return (
                                            <div key={tx.id} className="grid grid-cols-12 items-center px-6 py-4 bg-[#0A2633]/50 rounded-2xl border border-[#1D546D]/10 hover:border-[#75B9BE]/30 transition-all group">
                                                <div className="col-span-3 text-xs font-bold text-[#75B9BE]/70">
                                                    {formatDate(tx.createdAt)}
                                                </div>
                                                <div className="col-span-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${isSale ? 'bg-red-400/10 text-red-400' : 'bg-emerald-400/10 text-emerald-400'}`}>
                                                            {isSale ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                                                        </div>
                                                        <span className="text-sm font-bold text-[#FFFFFF] group-hover:text-[#75B9BE] transition-colors uppercase tracking-tight">
                                                            {tx.description}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`col-span-2 text-right font-black text-sm ${isSale ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {isSale ? '+' : ''}{formatCurrencyARS(tx.amount)}
                                                </div>
                                                <div className={`col-span-2 text-right text-sm font-black ${tx.runningBalance > 0 ? 'text-red-400/80' : 'text-[#75B9BE]'}`}>
                                                    {formatCurrencyARS(tx.runningBalance)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex-none px-8 py-4 border-t border-[#1D546D]/20 bg-[#061E29] flex justify-between items-center">
                        <p className="text-[10px] font-black text-[#75B9BE]/40 uppercase tracking-[0.2em]">
                            Seiton ERP • Sistema Contable de Distribución
                        </p>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-[#1D546D] text-[#FFFFFF] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#75B9BE] hover:text-[#061E29] transition-all"
                        >
                            Cerrar Historial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
