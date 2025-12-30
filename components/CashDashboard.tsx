"use client";

import { useState } from "react";
import {
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle,
    History,
    Plus,
    Minus,
    AlertCircle,
    CheckCircle2,
    Edit2,
    Trash
} from "lucide-react";
import { addMovement, closeCashBox, openCashBox, updateMovement, deleteMovement } from "@/app/actions/cash";
import { useRouter } from "next/navigation";

import { formatCurrencyARS } from "@/utils/formatters";

interface Movement {
    id: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
    description: string;
    category?: string | null;
    createdAt: string | Date; // Depending on how you serialize
    sale?: any; // To avoid circular complexity if needed, or specific type
}

interface CashDashboardProps {
    initialData: {
        movements: Movement[];
        income: number;
        expense: number;
        lastSession?: {
            status: string;
            initialAmount: number;
            openedAt: string | Date;
        };
    };
    isOpen: boolean;
    role?: string;
}

export default function CashDashboard({ initialData, isOpen, role }: CashDashboardProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [isOpening, setIsOpening] = useState(false);
    const [isAdding, setIsAdding] = useState<"INCOME" | "EXPENSE" | null>(null);
    const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [observations, setObservations] = useState("");
    const [initialBalance, setInitialBalance] = useState("");
    const [finalBalance, setFinalBalance] = useState("");
    const router = useRouter();

    const initialAmount = initialData.lastSession?.status === "OPEN" ? initialData.lastSession.initialAmount : 0;
    const currentBalance = initialAmount + initialData.income - initialData.expense;

    const handleAddMovement = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!isAdding && !editingMovement) || !amount || !description) return;

        let res;
        if (editingMovement) {
            res = await updateMovement(editingMovement.id, {
                type: editingMovement.type,
                amount: parseFloat(amount),
                description,
                category: editingMovement.category || "Manual"
            });
        } else {
            res = await addMovement({
                type: isAdding!,
                amount: parseFloat(amount),
                description,
                category: "Manual"
            });
        }

        if (res.success) {
            setIsAdding(null);
            setEditingMovement(null);
            setAmount("");
            setDescription("");
            router.refresh();
        } else {
            alert(res.error);
        }
    };

    const handleDeleteMovement = async (id: string) => {
        if (!confirm("¿Está seguro de eliminar este movimiento?")) return;
        const res = await deleteMovement(id);
        if (res.success) {
            router.refresh();
        } else {
            alert(res.error);
        }
    };

    const handleOpenBox = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await openCashBox(parseFloat(initialBalance));
        if (res.success) {
            setIsOpening(false);
            setInitialBalance("");
            router.refresh();
        } else {
            alert(res.error);
        }
    };

    const handleCloseBox = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await closeCashBox({
            finalAmount: parseFloat(finalBalance),
            observations
        });
        if (res.success) {
            setIsClosing(false);
            setObservations("");
            setFinalBalance("");
            router.refresh();
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Notification Banner */}
            {isOpen && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest">
                            Sesión activa: La caja está abierta y lista para operar.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsClosing(true)}
                        className="text-[10px] font-black text-emerald-400 hover:text-white uppercase tracking-tighter transition-colors"
                    >
                        Cerrar sesión actual
                    </button>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="premium-card p-6 rounded-3xl bg-[#0A2633]/50 border border-[#1D546D]/30 flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-[#75B9BE]/10 rounded-xl">
                            <Wallet className="h-6 w-6 text-[#75B9BE]" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#75B9BE]/60">Balance Actual</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-[#FFFFFF] tracking-tight">
                            {formatCurrencyARS(currentBalance)}
                        </h3>
                        <p className="text-xs text-[#75B9BE] mt-1 font-medium">Disponible en caja</p>
                    </div>
                </div>

                <div className="premium-card p-6 rounded-3xl bg-[#0A2633]/30 border border-[#1D546D]/20 flex flex-col justify-between h-40 group hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                            <ArrowUpCircle className="h-6 w-6 text-emerald-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Ingresos</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-emerald-400 tracking-tight">
                            {formatCurrencyARS(initialData.income)}
                        </h3>
                        <p className="text-xs text-emerald-500/80 mt-1 font-medium">{initialData.movements.filter(m => m.type === "INCOME").length} movimientos</p>
                    </div>
                </div>

                <div className="premium-card p-6 rounded-3xl bg-[#0A2633]/30 border border-[#1D546D]/20 flex flex-col justify-between h-40 group hover:border-red-500/30 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
                            <ArrowDownCircle className="h-6 w-6 text-red-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500/60">Egresos</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-red-400 tracking-tight">
                            {formatCurrencyARS(initialData.expense)}
                        </h3>
                        <p className="text-xs text-red-500/80 mt-1 font-medium">{initialData.movements.filter(m => m.type === "EXPENSE").length} movimientos</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => setIsAdding("INCOME")}
                        disabled={!isOpen}
                        className="flex-1 bg-[#1D546D]/20 hover:bg-[#1D546D]/40 border border-[#1D546D]/30 rounded-2xl flex items-center justify-center gap-3 text-emerald-400 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:scale-100"
                    >
                        <Plus className="h-4 w-4" /> Ingreso Extra
                    </button>
                    <button
                        onClick={() => setIsAdding("EXPENSE")}
                        disabled={!isOpen}
                        className="flex-1 bg-[#1D546D]/20 hover:bg-[#1D546D]/40 border border-[#1D546D]/30 rounded-2xl flex items-center justify-center gap-3 text-red-400 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:scale-100"
                    >
                        <Minus className="h-4 w-4" /> Registrar Gasto
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
                {/* Movements List */}
                <div className="lg:col-span-2 premium-card p-1 rounded-[2.5rem] h-full flex flex-col">
                    <div className="bg-[#061E29] rounded-[calc(2.5rem-4px)] flex-1 overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-[#1D546D]/20 flex justify-between items-center bg-[#061E29]">
                            <h3 className="text-xl font-black text-[#FFFFFF] flex items-center gap-3">
                                <History className="h-5 w-5 text-[#75B9BE]" /> MOVIMIENTOS DEL DÍA
                            </h3>
                            {isOpen ? (
                                <button
                                    onClick={() => setIsClosing(true)}
                                    className="bg-red-500/10 text-red-400 border border-red-500/30 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-[#FFFFFF] transition-all shadow-lg shadow-red-500/10"
                                >
                                    Cerrar Caja
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsOpening(true)}
                                    className="bg-[#75B9BE] text-[#061E29] px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#FFFFFF] transition-all shadow-lg shadow-[#75B9BE]/20"
                                >
                                    Abrir Caja
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                            {initialData.movements.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-[#75B9BE]/40 opacity-50">
                                    <History className="h-12 w-12 mb-4" />
                                    <p className="text-sm font-bold uppercase tracking-widest">Sin movimientos hoy</p>
                                </div>
                            ) : (
                                initialData.movements.map((mov) => (
                                    <div key={mov.id} className="p-4 rounded-xl bg-[#0A2633]/50 border border-[#1D546D]/10 hover:border-[#75B9BE]/30 transition-colors flex justify-between items-center group">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${mov.type === "INCOME" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                                {mov.type === "INCOME" ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="text-[#FFFFFF] font-bold text-sm">{mov.description}</p>
                                                <p className="text-[#75B9BE]/60 text-xs font-medium uppercase tracking-wide">
                                                    {new Date(mov.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {mov.category || "General"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className={`text-lg font-black tracking-tight ${mov.type === "INCOME" ? "text-emerald-400" : "text-red-400"}`}>
                                                {mov.type === "INCOME" ? "+" : "-"}{formatCurrencyARS(mov.amount)}
                                            </span>
                                            {role === "ADMIN" && (
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingMovement(mov);
                                                            setAmount(mov.amount.toString());
                                                            setDescription(mov.description);
                                                        }}
                                                        className="p-2 hover:bg-[#1D546D]/30 rounded-lg text-[#75B9BE]"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMovement(mov.id)}
                                                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-500"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Panel / Close Panel */}
                <div className="lg:col-span-1 premium-card p-1 rounded-[2.5rem] h-full">
                    <div className="bg-linear-to-br from-[#0A2633] to-[#04141C] p-8 rounded-[calc(2.5rem-4px)] h-full flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#75B9BE]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <h3 className="text-lg font-black text-[#FFFFFF] mb-6 relative z-10 flex items-center gap-2">
                            INSIGHTS DE GESTIÓN
                        </h3>

                        <div className="space-y-4 flex-1 relative z-10">
                            <div className={`p-4 rounded-2xl border transition-all ${isOpen ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`h-2 w-2 rounded-full animate-pulse ${isOpen ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#FFFFFF]">Estado</p>
                                </div>
                                <p className={`text-xl font-black uppercase tracking-tighter ${isOpen ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isOpen ? 'Caja Abierta' : 'Caja Cerrada'}
                                </p>
                                <p className="text-[10px] text-[#75B9BE] mt-1 font-bold">
                                    {isOpen ? 'Puede registrar ventas y movimientos.' : 'Las ventas están bloqueadas.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-[#061E29]/50 border border-[#1D546D]/20">
                                <h4 className="text-[10px] font-black text-[#75B9BE] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3" /> Tips para el Usuario
                                </h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-2 text-[11px] text-[#FFFFFF]/70 leading-relaxed font-medium">
                                        <div className="h-1 w-1 rounded-full bg-[#75B9BE] mt-1.5 shrink-0" />
                                        <span>Abra la caja al iniciar el día con el fondo fijo disponible.</span>
                                    </li>
                                    <li className="flex gap-2 text-[11px] text-[#FFFFFF]/70 leading-relaxed font-medium">
                                        <div className="h-1 w-1 rounded-full bg-[#75B9BE] mt-1.5 shrink-0" />
                                        <span>Use "Ingreso Extra" para aportes manuales o cambio.</span>
                                    </li>
                                    <li className="flex gap-2 text-[11px] text-[#FFFFFF]/70 leading-relaxed font-medium">
                                        <div className="h-1 w-1 rounded-full bg-[#75B9BE] mt-1.5 shrink-0" />
                                        <span>Realice el arqueo físico x billetes antes de cerrar.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-auto relative z-10 border-t border-[#1D546D]/20 pt-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-[#75B9BE] uppercase tracking-widest">Seguridad Seiton</span>
                                <CheckCircle2 className="h-4 w-4 text-[#75B9BE] opacity-40" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals Handling */}
            {(isAdding || isClosing || isOpening || editingMovement) && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
                    <div className="premium-card w-full max-w-md p-1 rounded-3xl animate-in zoom-in-95 duration-200">
                        <div className="bg-[#061E29] p-8 rounded-[calc(1.5rem-4px)] border border-[#1D546D]/20 shadow-2xl">
                            <h3 className="text-2xl font-black text-[#FFFFFF] mb-6 uppercase tracking-tight flex items-center gap-3">
                                {isOpening ? (
                                    <><Wallet className="h-6 w-6 text-[#75B9BE]" /> Abrir Caja</>
                                ) : isClosing ? (
                                    <><CheckCircle2 className="h-6 w-6 text-red-400" /> Cerrar Caja</>
                                ) : (isAdding === "INCOME" || editingMovement?.type === "INCOME") ? (
                                    <><Plus className="h-6 w-6 text-emerald-400" /> {editingMovement ? "Editar Ingreso" : "Nuevo Ingreso"}</>
                                ) : (
                                    <><Minus className="h-6 w-6 text-red-400" /> {editingMovement ? "Editar Gasto" : "Nuevo Gasto"}</>
                                )}
                            </h3>

                            {isOpening ? (
                                <form onSubmit={handleOpenBox} className="space-y-6">
                                    <div className="p-4 bg-[#75B9BE]/5 rounded-xl border border-[#75B9BE]/20 mb-4">
                                        <p className="text-xs text-[#75B9BE] leading-relaxed uppercase font-bold tracking-tight">
                                            Ingrese el monto inicial con el que comienza esta sesión de caja (Fondo fijo).
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#75B9BE] ml-1">Monto Inicial (Pescos)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75B9BE] font-bold">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                autoFocus
                                                value={initialBalance}
                                                onChange={e => setInitialBalance(e.target.value)}
                                                className="w-full bg-[#0A2633] border border-[#1D546D]/30 rounded-xl py-4 pl-8 pr-4 text-[#FFFFFF] font-black outline-none focus:border-[#75B9BE] text-2xl"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setIsOpening(false)} className="flex-1 py-3 text-[#75B9BE] hover:text-[#FFFFFF] font-bold text-xs uppercase tracking-widest">Cancelar</button>
                                        <button type="submit" className="flex-2 py-4 bg-[#75B9BE] text-[#061E29] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#FFFFFF] shadow-lg shadow-[#75B9BE]/20 transition-all">
                                            Confirmar Apertura
                                        </button>
                                    </div>
                                </form>
                            ) : isClosing ? (
                                <form onSubmit={handleCloseBox} className="space-y-6">
                                    <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20 mb-4">
                                        <p className="text-xs text-red-500 leading-relaxed uppercase font-bold tracking-tight">
                                            CONTROL HUMANO: Ingrese la cantidad de dinero física que queda en la caja para finalizar la sesión.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#75B9BE] ml-1">Efectivo Real en Caja</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75B9BE] font-bold">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                autoFocus
                                                value={finalBalance}
                                                onChange={e => setFinalBalance(e.target.value)}
                                                className="w-full bg-[#0A2633] border border-[#1D546D]/30 rounded-xl py-4 pl-8 pr-4 text-[#FFFFFF] font-black outline-none focus:border-red-500 text-2xl"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <p className="text-[10px] text-[#75B9BE]/60 italic mt-1">
                                            (Cálculo sugerido del sistema: {formatCurrencyARS(currentBalance)})
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#75B9BE] ml-1">Observaciones / Notas</label>
                                        <textarea
                                            value={observations}
                                            onChange={e => setObservations(e.target.value)}
                                            placeholder="Ej: Faltante de 10 pesos, retiro de recaudación, etc."
                                            className="w-full bg-[#0A2633] border border-[#1D546D]/30 rounded-xl p-4 text-[#FFFFFF] text-sm outline-none focus:border-[#75B9BE] min-h-[100px]"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setIsClosing(false)} className="flex-1 py-3 text-[#75B9BE] hover:text-[#FFFFFF] font-bold text-xs uppercase tracking-widest">Cancelar</button>
                                        <button type="submit" className="flex-2 py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 shadow-lg shadow-red-500/20 transition-all">
                                            Confirmar Cierre de Caja
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleAddMovement} className="space-y-6">
                                    {/* ... existing income/expense form ... */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#75B9BE] ml-1">Monto</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75B9BE] font-bold">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                autoFocus
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                className="w-full bg-[#0A2633] border border-[#1D546D]/30 rounded-xl py-3 pl-8 pr-4 text-[#FFFFFF] font-bold outline-none focus:border-[#75B9BE] text-lg"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#75B9BE] ml-1">Descripción</label>
                                        <input
                                            required
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            className="w-full bg-[#0A2633] border border-[#1D546D]/30 rounded-xl py-3 px-4 text-[#FFFFFF] text-sm font-bold outline-none focus:border-[#75B9BE]"
                                            placeholder="Motivo del movimiento..."
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => { setIsAdding(null); setEditingMovement(null); setAmount(""); setDescription(""); }} className="flex-1 py-3 text-[#75B9BE] hover:text-[#FFFFFF] font-bold text-xs uppercase tracking-widest">Cancelar</button>
                                        <button type="submit" className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${(isAdding === "INCOME" || editingMovement?.type === "INCOME") ? "bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-400" : "bg-red-500 text-white shadow-red-500/20 hover:bg-red-400"}`}>
                                            {editingMovement ? "Actualizar" : "Guardar"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
