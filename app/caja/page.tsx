import { getDailyMovements, isCashBoxOpen } from "@/app/actions/cash";
import { getUser } from "@/app/actions/auth";
import CashDashboard from "@/components/CashDashboard";
import { Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CashPage() {
    const RAW_dailyData = await getDailyMovements();
    const dailyData = JSON.parse(JSON.stringify(RAW_dailyData));
    const isOpen = await isCashBoxOpen();
    const session = await getUser();
    const userRole = session?.role as string | undefined;

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-[#FFFFFF] uppercase">
                        Caja <span className="text-[#75B9BE]">Chica</span>
                    </h1>
                    <p className="text-[#75B9BE] font-bold mt-2 uppercase tracking-[0.2em] text-xs">Gestión de ingresos y egresos diarios</p>
                </div>

                <div className="flex items-center gap-3 bg-[#1D546D]/20 px-6 py-3 rounded-2xl border border-[#1D546D]/30 shadow-inner">
                    <Wallet className="h-5 w-5 text-[#75B9BE]" />
                    <span className="text-sm font-black text-[#FFFFFF] uppercase tracking-wider">
                        {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            <CashDashboard initialData={dailyData} isOpen={isOpen} role={userRole} />
        </div>
    );
}
