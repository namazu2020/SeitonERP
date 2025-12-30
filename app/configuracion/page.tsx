import prisma from "@/lib/prisma";
import { Settings, Save, Building2, MapPin, Phone, Mail, Hash, ShieldCheck, Lock } from "lucide-react";
import { revalidatePath } from "next/cache";
import { getUser } from "@/app/actions/auth";
import ResetDataButton from "@/components/ResetDataButton";

export const dynamic = "force-dynamic";

async function updateConfig(formData: FormData) {
    "use server";

    const companyName = formData.get("companyName") as string;
    const taxId = formData.get("taxId") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;

    await prisma.config.upsert({
        where: { id: "default" },
        update: { companyName, taxId, address, phone, email },
        create: { id: "default", companyName, taxId, address, phone, email },
    });

    revalidatePath("/configuracion");
}

export default async function ConfigPage() {
    const config = await prisma.config.findUnique({
        where: { id: "default" },
    }) || {
        companyName: "Seiton Motors",
        taxId: "30-00000000-0",
        address: "",
        phone: "",
        email: "",
    };

    const session = await getUser();
    const isAdmin = session?.role === "ADMIN";

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-[#FFFFFF] uppercase">
                        Ajustes de <span className="text-[#75B9BE]">Sistema</span>
                    </h1>
                    <p className="text-[#75B9BE] font-bold mt-2 uppercase tracking-[0.2em] text-xs">Identidad corporativa y facturación</p>
                </div>
                <div className="flex items-center gap-3 bg-[#1D546D]/20 px-6 py-3 rounded-2xl border border-[#1D546D]/30 shadow-inner">
                    <ShieldCheck className="h-5 w-5 text-[#75B9BE]" />
                    <span className="text-sm font-black text-[#FFFFFF]">Entorno Seguro SSL</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left side: Instructions/Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="premium-card p-8 rounded-3xl bg-[#0A2633]/30">
                        <h3 className="text-lg font-black text-[#FFFFFF] mb-4">Información Fiscal</h3>
                        <p className="text-sm text-[#75B9BE] leading-relaxed">
                            Los datos ingresados en este formulario se utilizarán para la generación automática de facturas PDF y reportes oficiales.
                        </p>
                        <div className="mt-8 pt-8 border-t border-[#1D546D]/20 space-y-4">
                            <div className="flex items-center gap-4 text-[#75B9BE]/60 italic text-xs">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#75B9BE]" />
                                <span>Razón Social según AFIP/ARCA</span>
                            </div>
                            <div className="flex items-center gap-4 text-[#75B9BE]/60 italic text-xs">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#5F9598]" />
                                <span>CUIT sin guiones</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-linear-to-br from-[#1D546D]/10 to-transparent border border-[#1D546D]/10">
                        <Settings className="h-12 w-12 text-[#75B9BE] mb-6 opacity-20" />
                        <h4 className="font-bold text-[#FFFFFF] mb-2 text-sm uppercase">Copia de Seguridad</h4>
                        <p className="text-xs text-[#75B9BE] font-medium leading-relaxed">
                            La base de datos local se respalda automáticamente cada 24 horas en la carpeta /backups.
                        </p>
                    </div>

                    {isAdmin && (
                        <div className="pt-4">
                            <h4 className="font-bold text-red-500 mb-4 text-[10px] uppercase tracking-[0.3em]">Acciones Críticas</h4>
                            <ResetDataButton />
                        </div>
                    )}
                </div>

                {/* Right side: Form */}
                <div className="lg:col-span-2">
                    {!isAdmin && (
                        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center gap-3">
                            <Lock className="h-5 w-5 text-yellow-500" />
                            <p className="text-yellow-500 font-bold text-xs uppercase tracking-wide">
                                Modo Solo Lectura: Solo administradores pueden modificar la configuración.
                            </p>
                        </div>
                    )}
                    <form action={updateConfig} className="premium-card p-1 rounded-[2.5rem]">
                        <fieldset disabled={!isAdmin} className="bg-[#04141C] p-10 rounded-[calc(2.5rem-4px)] space-y-8 group-disabled:opacity-75">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#75B9BE] group-focus-within:text-[#FFFFFF] transition-colors">
                                        Razón Social de la Distribuidora
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1D546D] h-5 w-5" />
                                        <input
                                            name="companyName"
                                            defaultValue={config.companyName}
                                            className="w-full pl-12 pr-6 py-4 bg-[#0A2633] border border-[#1D546D]/30 rounded-2xl outline-none focus:ring-2 focus:ring-[#75B9BE] transition-all text-[#FFFFFF] font-bold shadow-inner"
                                            placeholder="Ej: Seiton Motors S.A."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#75B9BE] group-focus-within:text-[#FFFFFF] transition-colors">
                                        C.U.I.T. Empresa
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1D546D] h-5 w-5" />
                                        <input
                                            name="taxId"
                                            defaultValue={config.taxId}
                                            className="w-full pl-12 pr-6 py-4 bg-[#0A2633] border border-[#1D546D]/30 rounded-2xl outline-none focus:ring-2 focus:ring-[#75B9BE] transition-all text-[#FFFFFF] font-bold shadow-inner"
                                            placeholder="30-XXXXXXXX-X"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 md:col-span-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#75B9BE] group-focus-within:text-[#FFFFFF] transition-colors">
                                        Domicilio Comercial Principal
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1D546D] h-5 w-5" />
                                        <input
                                            name="address"
                                            defaultValue={config.address}
                                            className="w-full pl-12 pr-6 py-4 bg-[#0A2633] border border-[#1D546D]/30 rounded-2xl outline-none focus:ring-2 focus:ring-[#75B9BE] transition-all text-[#FFFFFF] font-bold shadow-inner"
                                            placeholder="Ej: Av. Juan B. Justo 1234, CABA"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#75B9BE] group-focus-within:text-[#FFFFFF] transition-colors">
                                        Línea de Atención
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1D546D] h-5 w-5" />
                                        <input
                                            name="phone"
                                            defaultValue={config.phone || ""}
                                            className="w-full pl-12 pr-6 py-4 bg-[#0A2633] border border-[#1D546D]/30 rounded-2xl outline-none focus:ring-2 focus:ring-[#75B9BE] transition-all text-[#FFFFFF] font-bold shadow-inner"
                                            placeholder="+54 11 XXXX-XXXX"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#75B9BE] group-focus-within:text-[#FFFFFF] transition-colors">
                                        Correo Corporativo
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1D546D] h-5 w-5" />
                                        <input
                                            name="email"
                                            defaultValue={config.email || ""}
                                            className="w-full pl-12 pr-6 py-4 bg-[#0A2633] border border-[#1D546D]/30 rounded-2xl outline-none focus:ring-2 focus:ring-[#75B9BE] transition-all text-[#FFFFFF] font-bold shadow-inner"
                                            placeholder="correo@empresa.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 mt-6 border-t border-[#1D546D]/20">
                                {isAdmin && (
                                    <button
                                        type="submit"
                                        className="w-full md:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-[#75B9BE] text-[#061E29] rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#75B9BE]/10 hover:bg-[#FFFFFF] hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        <Save className="h-5 w-5" /> Aplicar Configuración
                                    </button>
                                )}
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        </div>
    );
}
