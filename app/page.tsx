import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  TrendingUp,
  Package,
  Users,
  AlertCircle,
  ArrowUpRight,
  DollarSign,
  Zap,
  Layers,
  Activity
} from "lucide-react";
import { formatCurrencyARS, formatDate } from "@/utils/formatters";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const productsCount = await prisma.product.count();
  const clientsCount = await prisma.client.count();
  const lowStockProducts = await prisma.product.count({
    where: { stockActual: { lte: prisma.product.fields.stockMin } }
  });

  const salesToday = await prisma.sale.aggregate({
    _sum: { total: true },
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  });

  const recentSales = await prisma.sale.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { client: true }
  });

  const stats = [
    { name: "Recaudación Hoy", value: formatCurrencyARS(salesToday._sum.total || 0), icon: DollarSign, trend: "+12.5%", color: "text-[#75B9BE]", bg: "bg-[#75B9BE]/10" },
    { name: "Inv. Valorizado", value: productsCount.toString(), icon: Layers, trend: "Items", color: "text-[#1D546D]", bg: "bg-[#1D546D]/20" },
    {
      name: "Faltantes Stock",
      value: lowStockProducts.toString(),
      icon: AlertCircle,
      trend: lowStockProducts === 0 ? "Normal" : "Crítico",
      color: lowStockProducts === 0 ? "text-emerald-400" : "text-red-400",
      bg: lowStockProducts === 0 ? "bg-emerald-400/10" : "bg-red-400/10"
    },
    { name: "Clientes Activos", value: clientsCount.toString(), icon: Users, trend: "+2 nuevos", color: "text-[#FFFFFF]", bg: "bg-[#1D546D]/10" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700">
      {/* ... Header ... */}
      <div className="relative group p-1 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-[#1D546D] via-[#75B9BE] to-transparent opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
        <div className="relative bg-[#0A2633]/50 backdrop-blur-3xl p-10 rounded-[calc(1.5rem+4px)] border border-[#1D546D]/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-[#FFFFFF]">
                CONTROL DE <span className="text-[#75B9BE]">PANEL</span>
              </h1>
              <div className="flex items-center gap-3 mt-4">
                <span className="flex items-center gap-2 text-sm font-bold bg-[#1D546D]/30 text-[#75B9BE] px-4 py-1.5 rounded-full border border-[#1D546D]/50 uppercase tracking-widest">
                  <Activity className="h-4 w-4 animate-pulse" /> Live Now
                </span>
                <span className="text-[#75B9BE]/60 text-sm font-medium">Seiton Motors Distribuidora</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-[#04141C] p-4 rounded-2xl border border-[#1D546D]/30 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#75B9BE]/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-[#75B9BE]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#75B9BE]/60">System Health</p>
                  <p className="text-lg font-bold text-[#FFFFFF]">OPTIMIZED</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={stat.name} className="premium-card p-1 rounded-3xl transition-transform hover:-translate-y-2 duration-300">
            <div className="bg-[#0A2633] p-8 rounded-[calc(1.5rem-2px)] h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border border-[#1D546D]/20 shadow-inner`}>
                  <stat.icon className="h-7 w-7" />
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${stat.bg} ${stat.color} border border-current/20`}>
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-[#75B9BE] text-xs font-black uppercase tracking-[0.2em] mb-2">{stat.name}</p>
                <h2 className="text-3xl font-black text-[#FFFFFF] tracking-tight">{stat.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Recent Sales Table */}
        <div className="lg:col-span-8 premium-card p-1 rounded-[2.5rem]">
          <div className="bg-[#04141C] p-10 rounded-[calc(2.5rem-4px)] h-full">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black flex items-center gap-4">
                <TrendingUp className="h-7 w-7 text-[#75B9BE]" /> VENTAS RECIENTES
              </h3>
              <Link href="/ventas" className="text-xs font-black text-[#75B9BE] hover:text-[#FFFFFF] transition-colors border-b-2 border-[#75B9BE]/20 hover:border-[#75B9BE] pb-1 uppercase tracking-widest">
                Nueva Venta
              </Link>
            </div>

            <div className="space-y-6">
              {recentSales.map((sale) => (
                <div key={sale.id} className="group flex justify-between items-center p-6 bg-[#0A2633]/50 hover:bg-[#1D546D]/10 border border-[#1D546D]/20 rounded-3xl transition-all hover:scale-[1.01]">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-[#04141C] border border-[#1D546D]/30 flex items-center justify-center font-black text-[#75B9BE] shadow-xl">
                      {sale.invoiceNumber.split('-').pop()}
                    </div>
                    <div>
                      <p className="font-black text-[#FFFFFF] text-lg uppercase tracking-tight">{sale.client?.name || "Consumidor Final"}</p>
                      <p className="text-xs text-[#75B9BE] font-bold mt-1">
                        {sale.paymentMethod} • {formatDate(sale.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#75B9BE] tracking-tighter">{formatCurrencyARS(sale.total)}</p>
                    <div className="flex items-center gap-2 justify-end mt-1 text-[10px] font-black text-[#FFFFFF]/40 uppercase tracking-widest">
                      {sale.invoiceType} <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && (
                <div className="text-center py-10 text-[#75B9BE]/40 font-bold uppercase tracking-widest">
                  No hay ventas registradas hoy
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Info Component */}
        <div className="lg:col-span-4 premium-card p-1 rounded-[2.5rem]">
          <div className="bg-linear-to-br from-[#1D546D] to-[#04141C] p-10 rounded-[calc(2.5rem-4px)] h-full relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#75B9BE]/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-8 text-[#FFFFFF] leading-tight uppercase tracking-tighter">
                Sistema de Gestión <br />
                <span className="text-[#75B9BE]">Seiton Cloud v2.1</span>
              </h3>
              <div className="space-y-6">
                <div className="p-6 bg-[#04141C]/60 rounded-3xl border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                    <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Base de Datos OK</p>
                  </div>
                  <p className="text-sm text-[#FFFFFF]/80 leading-relaxed font-medium">
                    Sincronización local activa. Todos los cambios se guardan automáticamente encriptados.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12">
              <Link href="/ventas" className="block w-full text-center py-5 bg-[#75B9BE] text-[#04141C] rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-[1.03] active:scale-[0.98] transition-all">
                INICIAR NUEVA VENTA
              </Link>
              <p className="text-[10px] text-center mt-6 font-black text-[#FFFFFF]/30 uppercase tracking-[0.3em]">
                Acceso Privado • Dev mode inactive
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
