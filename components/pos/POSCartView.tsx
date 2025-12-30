"use client";

import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { formatCurrencyARS } from "@/utils/formatters";
import { CartItem } from "@/hooks/usePOS";

interface POSCartViewProps {
    cart: CartItem[];
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
}

export default function POSCartView({ cart, removeFromCart, updateQuantity }: POSCartViewProps) {
    return (
        <div className="premium-card p-6 rounded-3xl min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black flex items-center gap-3">
                    <ShoppingCart className="h-7 w-7 text-[#5F9598]" /> Item Detalle
                </h2>
                <span className="bg-[#1D546D]/30 text-[#F3F4F4] px-4 py-1.5 rounded-full text-xs font-bold border border-[#1D546D]/50 uppercase tracking-widest">
                    {cart.length} Productos
                </span>
            </div>

            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-80 text-[#75B9BE]/40">
                    <div className="bg-[#0A2633] p-10 rounded-full border border-[#1D546D]/10 mb-6 animate-pulse">
                        <ShoppingCart className="h-20 w-20 opacity-20" />
                    </div>
                    <p className="text-lg font-medium tracking-tight">El carrito está esperando productos</p>
                    <p className="text-sm opacity-50">Selecciona un producto arriba para comenzar</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="group relative flex items-center justify-between p-5 bg-[#0A2633]/50 hover:bg-[#0A2633] rounded-2xl border border-[#1D546D]/20 transition-all hover:shadow-xl hover:-translate-y-0.5">
                            <div className="flex-1">
                                <p className="font-bold text-[#FFFFFF] text-lg">{item.name}</p>
                                <p className="text-xs text-[#75B9BE]/70">Unitario: {formatCurrencyARS(item.priceList * (1 + item.ivaRate / 100))} (IVA inc.)</p>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="flex items-center bg-[#061E29] rounded-xl border border-[#1D546D]/40 p-1">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:text-[#75B9BE] transition-colors"><Minus className="h-4 w-4" /></button>
                                    <span className="w-10 text-center font-black text-[#FFFFFF]">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:text-[#75B9BE] transition-colors"><Plus className="h-4 w-4" /></button>
                                </div>
                                <p className="w-40 text-right font-black text-xl text-[#FFFFFF] tracking-tight">
                                    {formatCurrencyARS(item.priceList * (1 + item.ivaRate / 100) * item.quantity)}
                                </p>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-[#75B9BE]/30 hover:text-red-400 hover:bg-red-400/10 p-2.5 rounded-xl transition-all"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
