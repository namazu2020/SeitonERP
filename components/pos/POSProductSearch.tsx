"use client";

import { Search, PackageSearch } from "lucide-react";
import { Product } from "@prisma/client";
import { formatCurrencyARS } from "@/utils/formatters";

interface POSProductSearchProps {
    search: string;
    setSearch: (value: string) => void;
    filteredProducts: Product[];
    addToCart: (product: Product) => void;
}

export default function POSProductSearch({
    search,
    setSearch,
    filteredProducts,
    addToCart
}: POSProductSearchProps) {
    return (
        <div className="premium-card p-1 rounded-3xl">
            <div className="bg-[#061E29] p-6 rounded-[calc(1.5rem-2px)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#1D546D]/10 rounded-full blur-3xl transition-all group-hover:bg-[#75B9BE]/20" />

                <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <PackageSearch className="h-6 w-6 text-[#75B9BE]" />
                        Búsqueda de Productos
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75B9BE] h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Ingresa SKU, Nombre o Modelo de vehículo..."
                            className="w-full pl-12 pr-6 py-4 bg-[#0A2633] border border-[#1D546D]/30 rounded-2xl focus:ring-2 focus:ring-[#75B9BE] focus:border-transparent outline-none transition-all text-[#FFFFFF] placeholder-[#75B9BE]/50 shadow-inner"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {filteredProducts.length > 0 && (
                        <div className="mt-4 bg-[#0A2633] border border-[#1D546D]/40 rounded-2xl divide-y divide-[#1D546D]/20 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                            {filteredProducts.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => addToCart(p)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-[#1D546D]/20 transition-all text-left group/item"
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className="h-10 w-10 rounded-xl bg-[#061E29] flex items-center justify-center border border-[#1D546D]/30 group-hover/item:border-[#75B9BE]/50">
                                            <span className="text-[10px] font-bold text-[#75B9BE]">{p.sku.split('-')[0]}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#FFFFFF] group-hover/item:text-[#75B9BE] transition-colors">{p.name}</p>
                                            <p className="text-xs text-[#75B9BE]">SKU: {p.sku} • Stock: <span className={p.stockActual < 5 ? "text-red-400 font-bold" : "text-[#FFFFFF]/70"}>{p.stockActual}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-[#75B9BE]">{formatCurrencyARS(p.priceList * (1 + p.ivaRate / 100))}</p>
                                        <span className="text-[10px] uppercase tracking-tighter text-[#FFFFFF]/30">Precio Final</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
