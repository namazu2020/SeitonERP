"use client";

import { useState, useEffect } from "react";
import StockTable from "@/components/StockTable";
import ProductForm from "@/components/ProductForm";
import { Plus, Package, TrendingDown, Layers, CheckCircle } from "lucide-react";
import { getProducts } from "@/app/actions/products";
import { getUser } from "@/app/actions/auth";
import { Product } from "@prisma/client";

export default function StockPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [stats, setStats] = useState({ total: 0, lowStock: 0, categories: 0 });
    const [userRole, setUserRole] = useState<string>("");

    const fetchProducts = async () => {
        const data = await getProducts();
        setProducts(data);

        // Calculate quick stats
        const low = data.filter((p) => p.stockActual <= p.stockMin).length;
        const cats = new Set(data.map((p) => p.category)).size;
        setStats({ total: data.length, lowStock: low, categories: cats });

        const user = await getUser();
        if (user) setUserRole(user.role);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedProduct(null);
        fetchProducts();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-[#FFFFFF] uppercase">
                        Gestión de <span className="text-[#75B9BE]">Inventario</span>
                    </h1>
                    <p className="text-[#75B9BE] font-bold mt-2 uppercase tracking-[0.2em] text-xs">Administración central de repuestos</p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="group relative flex items-center gap-4 bg-[#75B9BE] text-[#061E29] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-[#75B9BE]/20 hover:bg-[#FFFFFF] hover:-translate-y-1 transition-all active:scale-95 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <Plus className="h-5 w-5 relative z-10" />
                    <span className="relative z-10">Cargar Nuevo Producto</span>
                </button>
            </div>

            {/* Quick Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-card p-6 rounded-3xl bg-[#0A2633]/30 flex items-center gap-6 border-[#1D546D]/20">
                    <div className="h-14 w-14 rounded-2xl bg-[#75B9BE]/10 flex items-center justify-center text-[#75B9BE] border border-[#75B9BE]/20">
                        <Layers className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#75B9BE]/60">Total Referencias</p>
                        <p className="text-2xl font-black text-[#FFFFFF]">{stats.total} SKUs</p>
                    </div>
                </div>
                <div className="premium-card p-6 rounded-3xl bg-[#0A2633]/30 flex items-center gap-6 border-[#1D546D]/20">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${stats.lowStock === 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                        {stats.lowStock === 0 ? <CheckCircle className="h-7 w-7" /> : <TrendingDown className="h-7 w-7" />}
                    </div>
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${stats.lowStock === 0 ? "text-emerald-500/60" : "text-red-500/60"}`}>
                            {stats.lowStock === 0 ? "Estado Stock" : "Stock Crítico"}
                        </p>
                        <p className={`text-2xl font-black ${stats.lowStock === 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {stats.lowStock === 0 ? "Normal" : `${stats.lowStock} Alertas`}
                        </p>
                    </div>
                </div>
                <div className="premium-card p-6 rounded-3xl bg-[#0A2633]/30 flex items-center gap-6 border-[#1D546D]/20">
                    <div className="h-14 w-14 rounded-2xl bg-[#1D546D]/20 flex items-center justify-center text-[#1D546D] border border-[#1D546D]/30">
                        <Package className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#75B9BE]/60">Categorías Motor</p>
                        <p className="text-2xl font-black text-[#1D546D]">{stats.categories} Grupos</p>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="premium-card p-1 rounded-[2.5rem] bg-linear-to-b from-[#1D546D]/20 to-transparent">
                <div className="bg-[#04141C] rounded-[calc(2.5rem-4px)] overflow-hidden shadow-2xl">
                    <StockTable products={products} onEdit={handleEdit} role={userRole} />
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <ProductForm
                    onClose={handleCloseForm}
                    product={selectedProduct}
                    role={userRole}
                />
            )}
        </div>
    );
}
