"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Search } from "lucide-react";
import ClientTable from "@/components/ClientTable";
import ClientForm from "@/components/ClientForm";
import { getClients } from "@/app/actions/clients";
import { getUser } from "@/app/actions/auth";

import ClientPaymentModal from "@/components/ClientPaymentModal";
import ClientHistoryModal from "@/components/ClientHistoryModal";

import { Client } from "@prisma/client";

interface ClientWithCount extends Client {
    _count?: { sales: number };
}

export default function ClientsPage() {
    const [clients, setClients] = useState<ClientWithCount[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientWithCount | null>(null);
    const [search, setSearch] = useState("");

    const [isOpen, setIsOpen] = useState(false);
    const [userRole, setUserRole] = useState<string>("");

    const fetchClients = async () => {
        const data = await getClients(search);
        setClients(data);

        // Also check cash status
        const { isCashBoxOpen } = await import("@/app/actions/cash");
        setIsOpen(await isCashBoxOpen());

        // Get User Role
        const user = await getUser();
        if (user) setUserRole(user.role);
    };

    useEffect(() => {
        fetchClients();
    }, [search]);

    const handleAction = (client: ClientWithCount, mode: "EDIT" | "PAYMENT" | "HISTORY" = "EDIT") => {
        setSelectedClient(client);
        if (mode === "PAYMENT") {
            setShowPaymentModal(true);
        } else if (mode === "HISTORY") {
            setShowHistory(true);
        } else {
            setShowForm(true);
        }
    };

    const handleCloseModal = () => {
        setShowForm(false);
        setShowPaymentModal(false);
        setShowHistory(false);
        setSelectedClient(null);
        fetchClients();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* ... Header & Stats ... */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-[#FFFFFF] uppercase">
                        Gestión de <span className="text-[#75B9BE]">Clientes</span>
                    </h1>
                    <p className="text-[#75B9BE] font-bold mt-2 uppercase tracking-[0.2em] text-xs">Administración de Cartera</p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="group relative flex items-center gap-4 bg-[#75B9BE] text-[#061E29] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-[#75B9BE]/20 hover:bg-[#FFFFFF] hover:-translate-y-1 transition-all active:scale-95 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <Plus className="h-5 w-5 relative z-10" />
                    <span className="relative z-10">Nuevo Cliente</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-card p-6 rounded-3xl bg-[#0A2633]/30 flex items-center gap-6 border-[#1D546D]/20">
                    <div className="h-14 w-14 rounded-2xl bg-[#75B9BE]/10 flex items-center justify-center text-[#75B9BE] border border-[#75B9BE]/20">
                        <Users className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#75B9BE]/60">Total Clientes</p>
                        <p className="text-2xl font-black text-[#FFFFFF]">{clients.length}</p>
                    </div>
                </div>

                <div className="md:col-span-2 premium-card p-2 rounded-3xl bg-[#0A2633]/30 border border-[#1D546D]/20 flex items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#1D546D]" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, CUIT o email..."
                            className="w-full bg-transparent border-none py-4 pl-16 pr-6 text-[#FFFFFF] font-bold placeholder:text-[#1D546D] outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="premium-card p-1 rounded-[2.5rem] bg-linear-to-b from-[#1D546D]/20 to-transparent">
                <div className="bg-[#04141C] rounded-[calc(2.5rem-4px)] overflow-hidden shadow-2xl min-h-[400px]">
                    <ClientTable clients={clients} onEdit={handleAction} role={userRole} />
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <ClientForm
                    onClose={handleCloseModal}
                    client={selectedClient}
                />
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedClient && (
                <ClientPaymentModal
                    client={selectedClient}
                    isOpen={isOpen}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handleCloseModal}
                />
            )}

            {/* History Modal */}
            {showHistory && selectedClient && (
                <ClientHistoryModal
                    client={selectedClient}
                    onClose={() => setShowHistory(false)}
                />
            )}
        </div>
    );
}
