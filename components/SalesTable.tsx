"use client";

import { useState } from "react";
import { FileText, Eye, Download, Search, X } from "lucide-react";
import { generateInvoicePDF } from "@/utils/invoiceGenerator";
import { formatCurrencyARS, formatDate } from "@/utils/formatters";

interface SalesTableProps {
    sales: any[];
    config: any;
}

export default function SalesTable({ sales, config }: SalesTableProps) {
    const [selectedSale, setSelectedSale] = useState<any>(null);

    const handleGenerateInvoice = (sale: any) => {
        generateInvoicePDF(sale, config);
    };

    return (
        <div className="w-full">
            {/* Sales List Table */}
            <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-[#1D546D]/20">
                    <thead className="bg-[#0A2633]/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-black text-[#75B9BE] uppercase tracking-[0.2em]">Fecha</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-black text-[#75B9BE] uppercase tracking-[0.2em]">Factura</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-black text-[#75B9BE] uppercase tracking-[0.2em]">Cliente</th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-black text-[#75B9BE] uppercase tracking-[0.2em]">Total</th>
                            <th scope="col" className="px-6 py-4 text-center text-xs font-black text-[#75B9BE] uppercase tracking-[0.2em]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1D546D]/10 bg-transparent">
                        {sales.map((sale) => (
                            <tr key={sale.id} className="hover:bg-[#1D546D]/5 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFFFFF]/80">
                                    {formatDate(sale.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#FFFFFF]">
                                    {sale.invoiceNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFFFFF]/80">
                                    {sale.client?.name || "Consumidor Final"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-[#75B9BE]">
                                    {formatCurrencyARS(sale.total)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => setSelectedSale(sale)}
                                            className="p-2 text-[#75B9BE] hover:text-[#FFFFFF] bg-[#1D546D]/10 hover:bg-[#1D546D]/30 rounded-lg transition-all"
                                            title="Ver Detalle"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleGenerateInvoice(sale)}
                                            className="p-2 text-emerald-400 hover:text-emerald-100 bg-emerald-500/10 hover:bg-emerald-500/30 rounded-lg transition-all"
                                            title="Descargar Factura"
                                        >
                                            <Download className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sales.length === 0 && (
                    <div className="text-center py-10 text-[#75B9BE]/40 text-sm">
                        No se encontraron ventas registradas.
                    </div>
                )}
            </div>

            {/* Sale Detail Modal */}
            {selectedSale && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="premium-card rounded-3xl w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="bg-[#061E29] p-8 rounded-[calc(1.5rem-2px)] flex flex-col h-full max-h-[85vh]">
                            <div className="flex justify-between items-center mb-6 border-b border-[#1D546D]/20 pb-4">
                                <div>
                                    <h2 className="text-2xl font-black text-[#FFFFFF] uppercase tracking-tight">Detalle de Venta</h2>
                                    <p className="text-[#75B9BE] text-xs font-bold uppercase tracking-widest">{selectedSale.invoiceNumber}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedSale(null)}
                                    className="p-2 bg-[#0A2633] text-[#75B9BE] rounded-xl hover:bg-[#1D546D] hover:text-[#FFFFFF] transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                                {/* Info Items */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="p-3 bg-[#0A2633] rounded-xl border border-[#1D546D]/20">
                                        <p className="text-[10px] text-[#75B9BE] uppercase font-bold tracking-widest mb-1">Cliente</p>
                                        <p className="text-[#FFFFFF] font-bold">{selectedSale.client?.name || "Consumidor Final"}</p>
                                        <p className="text-[#FFFFFF]/60 text-xs">{selectedSale.client?.taxId || "-"}</p>
                                    </div>
                                    <div className="p-3 bg-[#0A2633] rounded-xl border border-[#1D546D]/20">
                                        <p className="text-[10px] text-[#75B9BE] uppercase font-bold tracking-widest mb-1">Fecha</p>
                                        <p className="text-[#FFFFFF] font-bold">{formatDate(selectedSale.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="bg-[#0A2633]/50 rounded-xl border border-[#1D546D]/20 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-[#0A2633]">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-[10px] font-black text-[#75B9BE] uppercase">Producto</th>
                                                <th className="px-4 py-3 text-center text-[10px] font-black text-[#75B9BE] uppercase">Cant</th>
                                                <th className="px-4 py-3 text-right text-[10px] font-black text-[#75B9BE] uppercase">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#1D546D]/10">
                                            {selectedSale.items.map((item: any) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3">
                                                        <p className="text-[#FFFFFF] font-bold text-xs">{item.name}</p>
                                                        <p className="text-[#75B9BE]/60 text-[10px]">{item.sku}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-[#FFFFFF]">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right text-[#FFFFFF]">{formatCurrencyARS(item.totalAtSale)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-[#1D546D]/20 flex justify-end items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] text-[#75B9BE] uppercase font-bold tracking-widest">Total Venta</p>
                                    <p className="text-3xl font-black text-[#FFFFFF] tracking-tighter">{formatCurrencyARS(selectedSale.total)}</p>
                                </div>
                                <button
                                    onClick={() => handleGenerateInvoice(selectedSale)}
                                    className="px-6 py-3 bg-[#75B9BE] text-[#061E29] rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#FFFFFF] transition-all flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" /> Factura
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
