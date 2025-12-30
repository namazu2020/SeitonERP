"use client";

import { AlertCircle, Plus } from "lucide-react";
import { Product, Client, Config } from "@prisma/client";
import { usePOS } from "@/hooks/usePOS";

// Sub-components
import POSProductSearch from "./pos/POSProductSearch";
import POSCartView from "./pos/POSCartView";
import POSCheckoutPanel from "./pos/POSCheckoutPanel";

interface POSProps {
    products: Product[];
    clients: Client[];
    config: Config | null;
    isCashBoxOpen: boolean;
}

export default function POS({ products, clients, config, isCashBoxOpen }: POSProps) {
    const {
        cart, search, setSearch, selectedClientId, setSelectedClientId,
        paymentMethod, setPaymentMethod, useCredit, setUseCredit,
        isProcessing, lastSale, filteredProducts,
        addToCart, removeFromCart, updateQuantity, handleCheckout,
        subtotal, totalIva, total
    } = usePOS(products);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Product Selection & Cart */}
            <div className="lg:col-span-8 space-y-6">
                {!isCashBoxOpen && (
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div>
                                <p className="text-red-400 font-black text-sm uppercase tracking-tighter">Caja Cerrada</p>
                                <p className="text-red-400/70 text-xs font-bold uppercase tracking-widest">
                                    Debe abrir la caja para realizar ventas que impacten en el arqueo diario.
                                </p>
                            </div>
                        </div>
                        <a href="/caja" className="text-red-400 hover:text-white transition-colors">
                            <Plus className="h-5 w-5 rotate-45" />
                        </a>
                    </div>
                )}

                <POSProductSearch
                    search={search}
                    setSearch={setSearch}
                    filteredProducts={filteredProducts}
                    addToCart={addToCart}
                />

                <POSCartView
                    cart={cart}
                    removeFromCart={removeFromCart}
                    updateQuantity={updateQuantity}
                />
            </div>

            {/* Right Column: Order Summary & Checkout */}
            <POSCheckoutPanel
                clients={clients}
                selectedClientId={selectedClientId}
                setSelectedClientId={setSelectedClientId}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                useCredit={useCredit}
                setUseCredit={setUseCredit}
                subtotal={subtotal}
                totalIva={totalIva}
                total={total}
                isProcessing={isProcessing}
                isCashBoxOpen={isCashBoxOpen}
                handleCheckout={handleCheckout}
                cartLength={cart.length}
                lastSale={lastSale}
                config={config}
            />
        </div>
    );
}
