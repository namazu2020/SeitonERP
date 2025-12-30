"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Box,
    FileText,
    Home,
    Settings,
    ShoppingCart,
    Users,
    Wallet,
    LogOut,
    UserCircle
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { logoutAction } from "@/app/actions/auth";
import { useEffect, useState } from "react";
// actually getSession is server-only usually if it uses cookies() dynamic.
// Let's make a wrapper or just use a prop? 
// Better: fetch user info via a server action wrapper that is "use server" but callable from client.
// Wait, getSession in lib/auth uses cookies(), so it is a Server Action compatible function if marked 'use server' or just a helper.
// getSession is NOT marked 'use server' in lib/auth.ts. We should fix that or make a new action `getUser`

// Let's create a small client-side compatible action or just assume we'll pass it? No, Sidebar is client component.
// We will create a getUser action.

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: "Resumen", href: "/", icon: Home },
    { name: "Ventas (POS)", href: "/ventas", icon: ShoppingCart },
    { name: "Inventario", href: "/stock", icon: Box },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Caja Chica", href: "/caja", icon: Wallet },
    { name: "Facturación", href: "/facturacion", icon: FileText },
    { name: "Reportes", href: "/reportes", icon: BarChart3 },
    { name: "Ajustes", href: "/configuracion", icon: Settings }, // Fixed path
];

interface SidebarProps {
    user?: { name?: string | null, role: string };
}

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col bg-[#04141C] border-r border-[#1D546D]/30 fixed left-0 top-0 z-50 transition-all duration-300">
            <div className="flex h-24 items-center justify-center border-b border-[#1D546D]/20 px-6 bg-linear-to-b from-[#0A2633] to-[#04141C]">
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-black tracking-tighter text-[#FFFFFF] drop-shadow-[0_0_15px_rgba(117,185,190,0.3)]">
                        SEITON<span className="text-[#75B9BE]">MOTORS</span>
                    </span>
                    <div className="h-0.5 w-16 bg-linear-to-r from-transparent via-[#75B9BE] to-transparent mt-2 opacity-50" />
                </div>
            </div>

            <nav className="flex-1 space-y-2 px-4 py-8 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    // Hide Settings for Employee? User mentions they can "see but not change" config?
                    // "no puede usar modulo configuracion, lo puede ver pero no efectuar cambios" -> So keep it visible.

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "active-nav text-[#FFFFFF] shadow-[0_0_20px_rgba(29,84,109,0.3)] bg-[#1D546D]/20 border border-[#1D546D]/50"
                                    : "text-[#75B9BE] hover:bg-[#1D546D]/10 hover:text-[#FFFFFF] border border-transparent"
                            )}
                        >
                            <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-[#75B9BE] transition-all duration-300", isActive ? "opacity-100" : "opacity-0")} />

                            <item.icon className={cn(
                                "h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                                isActive ? "text-[#75B9BE]" : "text-[#75B9BE]/60"
                            )} />
                            <span className="relative z-10">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[#1D546D]/20 bg-[#0A2633]/30 backdrop-blur-sm">
                <div className="flex flex-col gap-4">
                    {/* User Profile */}
                    <div className="flex items-center gap-3 px-2">
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#1D546D] to-[#0F2936] flex items-center justify-center border border-[#75B9BE]/30 shadow-inner">
                            <UserCircle className="text-[#75B9BE] h-6 w-6" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-white truncate">{user?.name || 'Usuario'}</span>
                            <span className="text-[10px] uppercase font-bold text-[#75B9BE]/70 tracking-wider">
                                {user?.role === 'ADMIN' ? 'Administrador' : 'Empleado'}
                            </span>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={async () => {
                            await logoutAction();
                            window.location.href = "/login";
                        }}
                        className="flex items-center justify-center gap-2 w-full bg-[#1D546D]/20 hover:bg-red-500/10 text-[#75B9BE] hover:text-red-400 border border-[#1D546D]/30 hover:border-red-500/30 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 group"
                    >
                        <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
