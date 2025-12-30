"use client";

import { useState } from "react";
import { X, Save, User, FileText, Phone, Mail, MapPin, CreditCard } from "lucide-react";
import { upsertClient } from "@/app/actions/clients";

interface ClientFormProps {
    onClose: () => void;
    client?: any;
}

const TAX_CONDITIONS = [
    "Consumidor Final",
    "Responsable Inscripto",
    "Monotributista",
    "Exento",
    "No Responsable"
];

export default function ClientForm({ onClose, client }: ClientFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: client?.name || "",
        taxId: client?.taxId || "",
        email: client?.email || "",
        phone: client?.phone || "",
        address: client?.address || "",
        taxCondition: client?.taxCondition || "Consumidor Final",
        currentAccountEnabled: client?.currentAccountEnabled || false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await upsertClient(client?.id, formData);
            onClose();
        } catch (error) {
            alert("Error al guardar el cliente");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="premium-card rounded-3xl w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
                <div className="bg-[#061E29] flex flex-col h-full rounded-[calc(1.5rem-2px)]">

                    {/* Header */}
                    <div className="flex-none px-6 py-4 border-b border-[#1D546D]/20 flex justify-between items-center bg-[#061E29]">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#1D546D]/20 p-2 rounded-lg">
                                <User className="h-5 w-5 text-[#75B9BE]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-[#FFFFFF] tracking-tight uppercase leading-none">
                                    {client ? "Editar" : "Nuevo"} <span className="text-[#75B9BE]">Cliente</span>
                                </h2>
                                <p className="text-[#75B9BE] text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">Gestión de Contactos</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-[#75B9BE] hover:text-[#FFFFFF] transition-colors bg-[#0A2633] rounded-lg hover:bg-[#1D546D]"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Form Body */}
                    <div className="p-6 overflow-y-auto max-h-[70vh]">
                        <form id="client-form" onSubmit={handleSubmit} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#75B9BE] ml-1">Nombre / Razón Social</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-[#0A2633] border border-[#1D546D]/30 rounded-xl text-[#FFFFFF] text-sm font-bold outline-none focus:border-[#75B9BE]"
                                        placeholder="Nombre completo"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#75B9BE] ml-1">DNI / CUIT</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1D546D]" />
                                        <input
                                            required
                                            value={formData.taxId}
                                            onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-[#0A2633] border border-[#1D546D]/30 rounded-xl text-[#FFFFFF] text-sm font-bold outline-none focus:border-[#75B9BE]"
                                            placeholder="Documento único"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#75B9BE] ml-1">Condición Fiscal</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1D546D]" />
                                        <select
                                            value={formData.taxCondition}
                                            onChange={e => setFormData({ ...formData, taxCondition: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-[#0A2633] border border-[#1D546D]/30 rounded-xl text-[#FFFFFF] text-sm font-bold outline-none focus:border-[#75B9BE] appearance-none"
                                        >
                                            {TAX_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#75B9BE] ml-1">Teléfono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1D546D]" />
                                        <input
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-[#0A2633] border border-[#1D546D]/30 rounded-xl text-[#FFFFFF] text-sm font-bold outline-none focus:border-[#75B9BE]"
                                            placeholder="Contacto telefónico"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#75B9BE] ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1D546D]" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-[#0A2633] border border-[#1D546D]/30 rounded-xl text-[#FFFFFF] text-sm font-bold outline-none focus:border-[#75B9BE]"
                                            placeholder="correo@ejemplo.com"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#75B9BE] ml-1">Dirección</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1D546D]" />
                                        <input
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-[#0A2633] border border-[#1D546D]/30 rounded-xl text-[#FFFFFF] text-sm font-bold outline-none focus:border-[#75B9BE]"
                                            placeholder="Domicilio completo"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2 space-y-1.5 pt-4">
                                    <div className="flex items-center gap-3 p-4 bg-[#1D546D]/10 rounded-2xl border border-[#1D546D]/30 group hover:border-[#75B9BE]/50 transition-all cursor-pointer"
                                        onClick={() => setFormData({ ...formData, currentAccountEnabled: !formData.currentAccountEnabled })}>
                                        <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.currentAccountEnabled ? "bg-[#75B9BE]" : "bg-[#0A2633] border border-[#1D546D]/30"}`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-[#FFFFFF] transition-all ${formData.currentAccountEnabled ? "right-1" : "left-1"}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-[#FFFFFF]">Habilitar Cuenta Corriente</p>
                                            <p className="text-[10px] text-[#75B9BE] font-bold uppercase tracking-wider">Permite realizar ventas a crédito a este cliente</p>
                                        </div>
                                    </div>
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
                            type="submit"
                            form="client-form"
                            disabled={loading}
                            className="flex-2 py-3 bg-[#75B9BE] text-[#061E29] rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#75B9BE]/10 hover:bg-[#FFFFFF] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Guardar Cliente
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
