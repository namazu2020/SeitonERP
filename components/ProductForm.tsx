import { X, Save, Car, Package, DollarSign, MapPin, Check, Trash2, Plus, Info, Lock } from "lucide-react";
import { Product } from "@prisma/client";
import { useProductForm } from "@/hooks/useProductForm";

interface ProductFormProps {
    onClose: () => void;
    product?: Product | null;
    role?: string;
}

export default function ProductForm({ onClose, product, role }: ProductFormProps) {
    const isRestricted = role === "EMPLOYEE" && !!product;
    const {
        formRef, loading, formData, setFormData, finalPrice,
        brands, categories, availableModels,
        isAddingCategory, setIsAddingCategory, newCategoryName, setNewCategoryName, saveNewCategory,
        isAddingBrand, setIsAddingBrand, newBrandName, setNewBrandName, saveNewBrand,
        isAddingModel, setIsAddingModel, newModelName, setNewModelName, saveNewModel,
        currentCompat, setCurrentCompat, addCompatibility, removeCompatibility,
        handleSubmit, triggerSubmit
    } = useProductForm(product || null, onClose);

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="premium-card rounded-3xl w-full max-w-5xl flex flex-col overflow-hidden shadow-2xl transition-all"
                style={{ height: '85vh', maxHeight: '800px' }}
            >
                <div className="bg-[#061E29] flex flex-col h-full rounded-[calc(1.5rem-2px)]">

                    {/* Header Fixed */}
                    <div className="flex-none px-6 py-4 border-b border-[#1D546D]/20 flex justify-between items-center bg-[#061E29]">
                        <div className="flex items-center gap-3">
                            {isRestricted && (
                                <div className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                                    <Lock className="h-4 w-4 text-yellow-500" />
                                </div>
                            )}
                            <div className="bg-[#1D546D]/20 p-2 rounded-lg">
                                <Package className="h-5 w-5 text-[#75B9BE]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-[#FFFFFF] tracking-tight uppercase leading-none">
                                    {product ? "Editar" : "Nuevo"} <span className="text-[#75B9BE]">Producto</span>
                                </h2>
                                <p className="text-[#75B9BE] text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">Gestión de Inventario</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-[#75B9BE] hover:text-[#FFFFFF] transition-colors bg-[#0A2633] rounded-lg hover:bg-[#1D546D]"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#061E29]">
                        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Top Row: Basic Info & New Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#75B9BE] ml-1">SKU</label>
                                    <input
                                        required
                                        disabled={isRestricted}
                                        value={formData.sku}
                                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-[#0A2633] border border-[#1D546D]/30 rounded-xl text-[#FFFFFF] text-sm font-bold outline-none focus:border-[#75B9BE] placeholder:text-[#75B9BE]/30 disabled:opacity-50"
                                        placeholder="Ej: ABC-123"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#75B9BE] ml-1">Cód. Fábrica</label>
                                    <input
                                        disabled={isRestricted}
                                        value={formData.factoryCode}
                                        onChange={e => setFormData({ ...formData, factoryCode: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-[#0A2633] border border-[#1D546D]/30 rounded-xl text-[#FFFFFF] text-sm font-bold outline-none focus:border-[#75B9BE] placeholder:text-[#75B9BE]/30 disabled:opacity-50"
                                        placeholder="Referencia"
                                    />
                                </div>

                                <div className="md:col-span-3 space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#75B9BE] ml-1">Categoría</label>
                                    {isAddingCategory ? (
                                        <div className="flex gap-1 animate-in fade-in">
                                            <input
                                                autoFocus
                                                value={newCategoryName}
                                                onChange={e => setNewCategoryName(e.target.value)}
                                                className="w-full px-3 py-2.5 bg-[#0A2633] border border-[#75B9BE] rounded-xl text-[#FFFFFF] text-sm font-bold outline-none"
                                                placeholder="Nueva..."
                                            />
                                            <button type="button" onClick={saveNewCategory} className="px-3 bg-[#75B9BE] rounded-xl text-[#061E29]"><Check className="h-4 w-4" /></button>
                                        </div>
                                    ) : (
                                        <select
                                            required
                                            disabled={isRestricted}
                                            value={formData.category}
                                            onChange={(e) => {
                                                if (e.target.value === "ADD") setIsAddingCategory(true);
                                                else setFormData({ ...formData, category: e.target.value });
                                            }}
                                            className="w-full px-3 py-2.5 bg-[#0A2633] border border-[#1D546D]/30 rounded-xl text-[#FFFFFF] text-sm font-bold outline-none focus:border-[#75B9BE] disabled:opacity-50"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            {!isRestricted && <option value="ADD" className="text-[#75B9BE] font-bold">+ Nueva</option>}
                                        </select>
                                    )}
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#75B9BE] ml-1">Proveedor</label>
                                    <input
                                        disabled={isRestricted}
                                        value={formData.supplier || ""}
                                        onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-[#0A2633] border border-[#1D546D]/30 rounded-xl text-[#FFFFFF] text-sm font-bold outline-none focus:border-[#75B9BE] placeholder:text-[#75B9BE]/30 disabled:opacity-50"
                                        placeholder="Nombre"
                                    />
                                </div>

                                <div className="md:col-span-3 space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#75B9BE] ml-1">Descripción</label>
                                    <input
                                        required
                                        disabled={isRestricted}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-[#0A2633] border border-[#1D546D]/30 rounded-xl text-[#FFFFFF] text-sm font-bold outline-none focus:border-[#75B9BE] placeholder:text-[#75B9BE]/30 disabled:opacity-50"
                                        placeholder="Nombre del producto"
                                    />
                                </div>
                            </div>

                            {/* Compatibility Section */}
                            <div className="bg-[#0A2633]/30 rounded-xl border border-[#1D546D]/20 p-4 space-y-4">
                                <h3 className="text-xs font-black text-[#75B9BE] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Car className="h-3 w-3" /> Vehículos Compatibles ({formData.compatibility.length})
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                    <select
                                        disabled={isRestricted}
                                        value={currentCompat.brand}
                                        onChange={(e) => setCurrentCompat({ ...currentCompat, brand: e.target.value, model: "" })}
                                        className="w-full px-3 py-2 bg-[#061E29] border border-[#1D546D]/30 rounded-lg text-[#FFFFFF] text-xs font-bold outline-none"
                                    >
                                        <option value="">Marca</option>
                                        {brands.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    <select
                                        disabled={!currentCompat.brand}
                                        value={currentCompat.model}
                                        onChange={(e) => setCurrentCompat({ ...currentCompat, model: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#061E29] border border-[#1D546D]/30 rounded-lg text-[#FFFFFF] text-xs font-bold outline-none"
                                    >
                                        <option value="">Modelo</option>
                                        {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <input
                                        placeholder="Año"
                                        type="number"
                                        value={currentCompat.year}
                                        onChange={e => setCurrentCompat({ ...currentCompat, year: e.target.value })}
                                        className="px-3 py-2 bg-[#061E29] border border-[#1D546D]/30 rounded-lg text-[#FFFFFF] text-xs font-bold outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={addCompatibility}
                                        disabled={!currentCompat.brand || !currentCompat.model}
                                        className="py-2 bg-[#75B9BE] text-[#061E29] rounded-lg font-black text-xs uppercase shadow hover:bg-white transition-all"
                                    >
                                        + Agregar
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pt-2">
                                    {formData.compatibility.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-[#061E29] border border-[#1D546D]/30 rounded-full group">
                                            <span className="text-[10px] font-bold text-white/80">{item.brand} {item.model} {item.year ? `(${item.year})` : ""}</span>
                                            <button type="button" onClick={() => removeCompatibility(idx)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Stock & Location */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#75B9BE] ml-1">Stock Actual</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.stockActual || 0}
                                        onChange={e => {
                                            const val = parseInt(e.target.value);
                                            setFormData({ ...formData, stockActual: isNaN(val) ? 0 : val });
                                        }}
                                        className="w-full px-3 py-2.5 bg-[#0A2633] border border-[#1D546D]/30 rounded-xl text-[#FFFFFF] font-bold outline-none focus:border-[#75B9BE] text-center"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#75B9BE] ml-1">Stock Mínimo</label>
                                    <input
                                        type="number"
                                        required
                                        disabled={isRestricted}
                                        value={formData.stockMin || 0}
                                        onChange={e => {
                                            const val = parseInt(e.target.value);
                                            setFormData({ ...formData, stockMin: isNaN(val) ? 0 : val });
                                        }}
                                        className="w-full px-3 py-2.5 bg-[#0A2633] border border-[#1D546D]/30 rounded-xl text-[#FFFFFF] font-bold outline-none focus:border-[#75B9BE] text-center disabled:opacity-50"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#75B9BE] ml-1">Ubicación</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1D546D]" />
                                        <input
                                            disabled={isRestricted}
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-[#0A2633] border border-[#1D546D]/30 rounded-xl text-[#FFFFFF] text-xs font-bold outline-none focus:border-[#75B9BE] disabled:opacity-50"
                                            placeholder="Estante / Fila"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Box - Highlighted */}
                            <div className="bg-[#1D546D]/10 rounded-2xl p-6 border border-[#1D546D]/30 grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-premium">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-[#75B9BE] tracking-widest ml-1">Precio Compra (Costo)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#75B9BE]" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            disabled={isRestricted}
                                            value={formData.purchasePrice || 0}
                                            onChange={e => {
                                                const val = parseFloat(e.target.value);
                                                setFormData({ ...formData, purchasePrice: isNaN(val) ? 0 : val });
                                            }}
                                            className="w-full pl-9 pr-4 py-3 bg-[#061E29] border border-[#1D546D]/40 rounded-xl text-[#FFFFFF] text-xl font-black outline-none focus:border-emerald-500 transition-all disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-[#75B9BE] tracking-widest ml-1">Precio Venta (Neto)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#75B9BE]" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            disabled={isRestricted}
                                            value={formData.priceList || 0}
                                            onChange={e => {
                                                const val = parseFloat(e.target.value);
                                                setFormData({ ...formData, priceList: isNaN(val) ? 0 : val });
                                            }}
                                            className="w-full pl-9 pr-4 py-3 bg-[#061E29] border border-[#1D546D]/40 rounded-xl text-[#FFFFFF] text-xl font-black outline-none focus:border-[#75B9BE] transition-all disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="text-center md:text-right bg-[#75B9BE]/10 p-4 rounded-xl border border-[#75B9BE]/20">
                                    <span className="text-[10px] font-black text-[#75B9BE] uppercase tracking-[0.2em] block mb-1">Total Consumidor Final</span>
                                    <span className="text-3xl font-black text-white tracking-tighter">
                                        ${finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <span className="block text-[9px] text-emerald-400 font-bold uppercase mt-1">IVA 21% Incluido</span>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="flex-none px-6 py-4 border-t border-[#1D546D]/20 bg-[#061E29] flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-[#0A2633] text-[#75B9BE] rounded-xl font-black text-xs uppercase tracking-widest border border-[#1D546D]/20 hover:bg-[#1D546D]/10 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={triggerSubmit}
                            className="flex-2 py-3 bg-[#75B9BE] text-[#061E29] rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Guardar Producto
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
