"use client";

import { useState } from "react";
import { Search, Edit2, Trash2, AlertTriangle, Box, Filter, Car, Layers } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { deleteProduct } from "@/app/actions/products";
import { Product } from "@prisma/client";

import { formatCurrencyARS } from "@/utils/formatters";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface StockTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
    role?: string;
}

export default function StockTable({ products, onEdit, role }: StockTableProps) {
    const [search, setSearch] = useState("");

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`¿Estás seguro de eliminar "${name}"?`)) {
            await deleteProduct(id);
        }
    };

    const parseCompatibility = (jsonString: string | null) => {
        if (!jsonString) return [];
        try {
            const parsed = JSON.parse(jsonString);
            if (Array.isArray(parsed)) return parsed;
            if (typeof parsed === 'object') return [parsed]; // Legacy support for single object
            return [];
        } catch (e) {
            return [];
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-8 border-b border-[#1D546D]/20 bg-[#0A2633]/30 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="relative w-full max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75B9BE] h-5 w-5 transition-colors group-focus-within:text-[#FFFFFF]" />
                    <input
                        type="text"
                        placeholder="Buscar por SKU, Nombre o Categoría..."
                        className="w-full pl-12 pr-6 py-4 bg-[#061E29] border border-[#1D546D]/30 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#75B9BE] focus:border-transparent transition-all text-[#FFFFFF] placeholder-[#75B9BE]/40"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <div className="bg-[#1D546D]/20 px-5 py-3 rounded-xl border border-[#1D546D]/30">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#75B9BE]/60">Inventario</p>
                        <p className="text-sm font-black text-[#FFFFFF]">{filtered.length} Productos</p>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-separate border-spacing-y-2 px-8">
                    <thead>
                        <tr className="text-[#75B9BE]/60 font-black text-[10px] uppercase tracking-[0.2em]">
                            <th className="px-6 py-4">SKU / Identificador</th>
                            <th className="px-6 py-4">Descripción / Compatibilidad</th>
                            <th className="px-6 py-4">Precio (IVA INC.)</th>
                            <th className="px-6 py-4">Disponibilidad</th>
                            <th className="px-6 py-4">Ubicación</th>
                            <th className="px-6 py-4 text-right">Gestión</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((product) => {
                            const isLowStock = product.stockActual <= product.stockMin;
                            const finalPrice = product.priceList * (1 + product.ivaRate / 100);
                            const vehicles = parseCompatibility(product.compatibility);

                            return (
                                <tr key={product.id} className="group hover:scale-[1.005] transition-all duration-300">
                                    <td className="px-6 py-5 bg-[#0A2633]/50 rounded-l-2xl border-y border-l border-[#1D546D]/10 group-hover:border-[#5F9598]/30 group-hover:bg-[#0A2633]">
                                        <span className="font-mono text-xs font-bold text-[#75B9BE]">{product.sku}</span>
                                        <div className="mt-1">
                                            <span className="bg-[#1D546D]/20 text-[#75B9BE] px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border border-[#1D546D]/10">
                                                {product.category}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 bg-[#0A2633]/50 border-y border-[#1D546D]/10 group-hover:border-[#5F9598]/30 group-hover:bg-[#0A2633]">
                                        <p className="font-black text-[#FFFFFF] group-hover:text-[#75B9BE] transition-colors">{product.name}</p>

                                        {/* Display Compatibility List */}
                                        {vehicles.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {vehicles.slice(0, 2).map((v: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-1.5 text-[10px] text-[#75B9BE] font-bold">
                                                        <Car className="h-3 w-3 opacity-70" />
                                                        <span>{v.brand} {v.model} {v.year ? `(${v.year})` : ''}</span>
                                                    </div>
                                                ))}
                                                {vehicles.length > 2 && (
                                                    <div className="flex items-center gap-1.5 text-[9px] text-[#75B9BE]/60 font-black uppercase tracking-wider pl-1">
                                                        <Layers className="h-2.5 w-2.5" />
                                                        <span>+{vehicles.length - 2} Modelos más...</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 bg-[#0A2633]/50 border-y border-[#1D546D]/10 group-hover:border-[#5F9598]/30 group-hover:bg-[#0A2633]">
                                        <p className="font-black text-lg text-[#FFFFFF] tracking-tight">{formatCurrencyARS(finalPrice)}</p>
                                        <p className="text-[10px] text-[#75B9BE]/40 font-bold uppercase tracking-tighter">Neto: {formatCurrencyARS(product.priceList)}</p>
                                    </td>
                                    <td className="px-6 py-5 bg-[#0A2633]/50 border-y border-[#1D546D]/10 group-hover:border-[#5F9598]/30 group-hover:bg-[#0A2633]">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-16 rounded-full bg-[#061E29] overflow-hidden border border-[#1D546D]/20">
                                                <div
                                                    className={cn(
                                                        "h-full transition-all duration-1000",
                                                        isLowStock ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-[#75B9BE] shadow-[0_0_10px_#75B9BE]"
                                                    )}
                                                    style={{ width: `${Math.min((product.stockActual / (Math.max(product.stockMin, 1) * 3)) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className={cn(
                                                "font-black text-sm tabular-nums",
                                                isLowStock ? "text-red-400 animate-pulse" : "text-[#FFFFFF]"
                                            )}>
                                                {product.stockActual}
                                            </span>
                                            {isLowStock && <AlertTriangle className="h-4 w-4 text-red-400" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 bg-[#0A2633]/50 border-y border-[#1D546D]/10 group-hover:border-[#5F9598]/30 group-hover:bg-[#0A2633]">
                                        <div className="flex items-center gap-2 text-[#75B9BE]/70">
                                            <Box className="h-4 w-4" />
                                            <span className="font-bold uppercase text-[10px] tracking-widest">{product.location || "S-R / INDEF"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 bg-[#0A2633]/50 rounded-r-2xl border-y border-r border-[#1D546D]/10 group-hover:border-[#5F9598]/30 group-hover:bg-[#0A2633]">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onEdit(product)}
                                                className="p-2.5 bg-[#061E29] hover:bg-[#1D546D]/30 border border-[#1D546D]/20 rounded-xl text-[#75B9BE] hover:text-[#FFFFFF] transition-all"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            {role === "ADMIN" && (
                                                <button
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                    className="p-2.5 bg-[#061E29] hover:bg-red-500/10 border border-[#1D546D]/20 rounded-xl text-[#75B9BE] hover:text-red-400 transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
