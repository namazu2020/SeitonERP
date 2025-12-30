import { useState, useMemo } from "react";
import { createSale } from "@/app/actions/sales";
import { Product, Client } from "@prisma/client";
import { round } from "@/utils/formatters";

export interface CartItem extends Product {
    quantity: number;
}

export function usePOS(products: Product[]) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState("");
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "Cuenta Corriente">("Efectivo");
    const [useCredit, setUseCredit] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastSale, setLastSale] = useState<any>(null);

    // Search Logic
    const filteredProducts = useMemo(() => {
        if (!search) return [];
        const s = search.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(s) ||
            p.sku.toLowerCase().includes(s)
        ).slice(0, 5);
    }, [search, products]);

    // Cart Operations
    const addToCart = (product: Product) => {
        if (product.stockActual <= 0) return;

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stockActual) return prev;
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setSearch("");
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                const product = products.find(p => p.id === id);
                if (newQty > 0 && product && newQty <= product.stockActual) {
                    return { ...item, quantity: newQty };
                }
            }
            return item;
        }));
    };

    // Totals
    const subtotal = round(cart.reduce((acc, item) => acc + (item.priceList * item.quantity), 0));
    const totalIva = round(cart.reduce((acc, item) => acc + (item.priceList * (item.ivaRate / 100) * item.quantity), 0));
    const total = round(subtotal + totalIva);

    // Checkout
    const handleCheckout = async () => {
        if (cart.length === 0) return;

        if (paymentMethod === "Cuenta Corriente" && !selectedClientId) {
            alert("Debe seleccionar un cliente para vender en Cuenta Corriente");
            return;
        }

        setIsProcessing(true);

        try {
            const res = await createSale({
                clientId: selectedClientId || undefined,
                items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
                paymentMethod: paymentMethod,
                invoiceType: "B",
                useCredit: useCredit,
            });

            if (res.success) {
                setLastSale(res.sale);
                setCart([]);
                // Keep client selected if Cta Cte? Maybe clear to avoid mistakes next time.
                // Standard behavior: clear.
                setSelectedClientId("");
                setPaymentMethod("Efectivo");
            } else {
                alert("Error: " + res.error);
            }
        } catch (err) {
            console.error(err);
            alert("Error al procesar la venta");
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        // State
        cart,
        search, setSearch,
        selectedClientId, setSelectedClientId,
        paymentMethod, setPaymentMethod,
        useCredit, setUseCredit,
        isProcessing,
        lastSale,
        filteredProducts,

        // Actions
        addToCart,
        removeFromCart,
        updateQuantity,
        handleCheckout,

        // Calculated
        subtotal,
        totalIva,
        total
    };
}
