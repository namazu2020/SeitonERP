"use client";

import { useState } from "react";
import { Edit2, Trash2, User, Phone, MapPin, Mail, FileText, ShoppingBag, History } from "lucide-react";
import { deleteClient } from "@/app/actions/clients";
import { Client } from "@prisma/client";
import { formatCurrencyARS } from "@/utils/formatters";

interface ClientWithCount extends Client {
    _count?: { sales: number };
}

interface ClientTableProps {
    clients: ClientWithCount[];
    onEdit: (client: ClientWithCount, mode?: "EDIT" | "PAYMENT" | "HISTORY") => void;
    role?: string;
}

export default function ClientTable({ clients, onEdit, role }: ClientTableProps) {
    const handleDelete = async (id: string) => {
        if (confirm("¿Está seguro de eliminar este cliente?")) {
            await deleteClient(id);
        }
    };

    return (
        <div className="w-full">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-[#1D546D]/20">
                        <thead className="bg-[#0A2633]/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-[#75B9BE] uppercase tracking-[0.2em]">Cliente</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-[#75B9BE] uppercase tracking-[0.2em] hidden sm:table-cell">Contacto</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-[#75B9BE] uppercase tracking-[0.2em] hidden md:table-cell">Condición</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-black text-[#75B9BE] uppercase tracking-[0.2em]">Saldo</th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-black text-[#75B9BE] uppercase tracking-[0.2em]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1D546D]/10 bg-transparent">
                            {clients.map((client) => (
                                <tr key={client.id} className="hover:bg-[#1D546D]/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-xl bg-[#1D546D]/20 flex items-center justify-center text-[#75B9BE] font-bold border border-[#1D546D]/30 group-hover:border-[#75B9BE]/50 transition-colors">
                                                    {client.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-[#FFFFFF]">{client.name}</div>
                                                <div className="text-xs text-[#75B9BE]/60 flex items-center gap-1 mt-0.5">
                                                    <FileText className="h-3 w-3" /> {client.taxId}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                        <div className="space-y-1">
                                            {client.phone && (
                                                <div className="flex items-center gap-2 text-xs text-[#FFFFFF]/80">
                                                    <Phone className="h-3 w-3 text-[#1D546D]" /> {client.phone}
                                                </div>
                                            )}
                                            {client.email && (
                                                <div className="flex items-center gap-2 text-xs text-[#FFFFFF]/80">
                                                    <Mail className="h-3 w-3 text-[#1D546D]" /> {client.email}
                                                </div>
                                            )}
                                            {client.address && (
                                                <div className="flex items-center gap-2 text-xs text-[#75B9BE]/60">
                                                    <MapPin className="h-3 w-3" /> {client.address}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                        <div>
                                            <span className="px-3 py-1 inline-flex text-[10px] leading-5 font-black uppercase tracking-widest rounded-full bg-[#1D546D]/20 text-[#75B9BE] border border-[#1D546D]/30">
                                                {client.taxCondition}
                                            </span>
                                            <div className="mt-2 flex items-center gap-1 text-[10px] text-[#75B9BE]/50 uppercase font-bold tracking-wider">
                                                <ShoppingBag className="h-3 w-3" /> {client._count?.sales || 0} Ventas
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className={`text-sm font-black ${(client.currentAccountBalance || 0) > 0 ? "text-red-400" : "text-[#75B9BE]"}`}>
                                            {formatCurrencyARS(client.currentAccountBalance || 0)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => onEdit(client, "HISTORY")}
                                                title="Ver Historial"
                                                className="text-[#75B9BE] hover:text-[#FFFFFF] transition-colors p-2 hover:bg-[#1D546D]/20 rounded-lg"
                                            >
                                                <History className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(client, "PAYMENT")}
                                                title="Registrar Pago"
                                                className="text-emerald-400 hover:text-[#FFFFFF] transition-colors p-2 hover:bg-emerald-400/20 rounded-lg"
                                            >
                                                <div className="h-4 w-4 font-bold">$</div>
                                            </button>
                                            {role === "ADMIN" && (
                                                <>
                                                    <button
                                                        onClick={() => onEdit(client)}
                                                        className="text-[#75B9BE] hover:text-[#FFFFFF] transition-colors p-2 hover:bg-[#1D546D]/20 rounded-lg"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(client.id)}
                                                        className="text-[#1D546D] hover:text-red-400 transition-colors p-2 hover:bg-red-400/10 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {clients.length === 0 && (
                <div className="text-center py-12">
                    <User className="mx-auto h-12 w-12 text-[#1D546D]/40" />
                    <h3 className="mt-2 text-sm font-bold text-[#FFFFFF] uppercase tracking-widest">No hay clientes</h3>
                    <p className="mt-1 text-xs text-[#75B9BE]/60">Comience agregando un nuevo cliente.</p>
                </div>
            )}
        </div>
    );
}
