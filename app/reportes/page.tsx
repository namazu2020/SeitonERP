import {
    getSalesStats,
    getTopProducts,
    getStockValuation,
    getCashFlowStats,
    getClientDebtStats,
    getBusinessHealthStats
} from "@/app/actions/reports";
import {
    BarChart3,
    TrendingUp,
    Package,
    DollarSign,
    Award,
    ArrowUpRight,
    Users,
    Wallet,
    Activity
} from "lucide-react";
import { formatCurrencyARS } from "@/utils/formatters";
import ReportCharts from "@/components/ReportCharts";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
    // Fetch analytics data in parallel for efficiency
    const [
        salesStats,
        topProducts,
        valuation,
        cashFlow,
        debtStats,
        healthStats
    ] = await Promise.all([
        getSalesStats('week'),
        getTopProducts(5),
        getStockValuation(),
        getCashFlowStats('week'),
        getClientDebtStats(),
        getBusinessHealthStats()
    ]);

    const totalSalesWeekly = salesStats.reduce((acc, curr) => acc + curr.total, 0);

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-2 premium-gradient rounded-full" />
                        <h1 className="text-4xl font-black tracking-tight text-[#FFFFFF] uppercase">
                            Inteligencia <span className="text-gradient">de Negocios</span>
                        </h1>
                    </div>
                    <p className="text-[#75B9BE]/60 font-bold uppercase tracking-[0.3em] text-[10px] ml-5">
                        Análisis de rendimiento y valoración de activos
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-[#0A2633]/40 p-1.5 rounded-2xl border border-[#1D546D]/20 backdrop-blur-md">
                    <div className="flex items-center gap-3 px-4 py-2 bg-[#1D546D]/20 rounded-xl border border-[#1D546D]/30">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        <span className="text-[10px] font-black text-[#FFFFFF] uppercase tracking-widest leading-none">Transmisión en vivo</span>
                    </div>
                    <div className="h-8 w-px bg-[#1D546D]/30" />
                    <div className="pr-4 text-[10px] font-black text-[#75B9BE]/40 uppercase tracking-widest">
                        v2.4.0-Estable
                    </div>
                </div>
            </div>

            {/* Top KPI row - High Emphasis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Ingresos (7d)", val: formatCurrencyARS(totalSalesWeekly), sub: "Volumen acumulado", icon: Wallet, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                    { label: "Valuación de Stock", val: formatCurrencyARS(valuation.totalValueRetail), sub: `${valuation.totalItems} unidades activas`, icon: Package, color: "text-[#75B9BE]", bg: "bg-[#75B9BE]/10" },
                    { label: "Cuentas por Cobrar", val: formatCurrencyARS(debtStats.totalDebt), sub: "Créditos pendientes", icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { label: "Líder de Ventas", val: topProducts[0]?.name || "N/A", sub: `${topProducts[0]?.quantity || 0} unidades distribuidas`, icon: Award, color: "text-indigo-400", bg: "bg-indigo-400/10" }
                ].map((kpi, i) => (
                    <div key={i} className="premium-card group relative p-8">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <kpi.icon className="h-16 w-16" />
                        </div>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color} border border-current/10`}>
                                <kpi.icon className="h-6 w-6" />
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                                <span className={`h-1.5 w-1.5 rounded-full ${kpi.color} animate-pulse`} />
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Monitoreado</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-[#75B9BE]/50 uppercase tracking-[0.2em] mb-2">{kpi.label}</p>
                        <h3 className="text-2xl font-black text-[#FFFFFF] tracking-tighter truncate leading-none mb-2">
                            {kpi.val}
                        </h3>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-wide">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* Analytical core */}
            <div className="space-y-8">
                <ReportCharts
                    salesData={salesStats}
                    cashFlowData={cashFlow}
                    stockData={valuation.categoryData}
                />
            </div>

            {/* Rankings Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Ranking Products */}
                <div className="lg:col-span-7 premium-card overflow-hidden">
                    <div className="p-10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-[#FFFFFF] tracking-tight uppercase">
                                    Velocidad <span className="text-[#75B9BE]">de Inventario</span>
                                </h3>
                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Productos con mayor rotación por volumen</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-[#1D546D]/10 border border-[#1D546D]/20 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-[#75B9BE]" />
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {topProducts.map((product, idx) => (
                                <div key={idx} className="group relative flex items-center justify-between p-5 rounded-2xl bg-[#0A2633]/30 border border-white/5 hover:border-[#75B9BE]/30 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-[#04141C] text-[#75B9BE] font-black text-sm border border-[#1D546D]/30 group-hover:border-[#75B9BE]/50 transition-colors shadow-xl">
                                            0{idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-[#FFFFFF] font-black text-base tracking-tight uppercase">{product.name}</p>
                                            <div className="flex items-center gap-4 mt-1.5">
                                                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                                    <ArrowUpRight className="h-3 w-3" /> {product.quantity} Unidades
                                                </span>
                                                <div className="h-3 w-px bg-white/10" />
                                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Valuación: {formatCurrencyARS(product.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full premium-gradient transition-all duration-1000"
                                            style={{ width: `${100 - (idx * 15)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Client Credit Exposure */}
                <div className="lg:col-span-5 premium-card bg-linear-to-br from-[#061E29] to-[#04141C]">
                    <div className="p-10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-[#FFFFFF] tracking-tight uppercase">
                                    Exposición <span className="text-amber-500">de Crédito</span>
                                </h3>
                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Saldos pendientes en cuenta corriente</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-amber-500" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {debtStats.topDebtors.map((client, idx) => (
                                <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-[#04141C]/40 border border-white/5 hover:bg-amber-500/5 hover:border-amber-500/20 transition-all transition-duration-500">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-linear-to-tr from-[#0A2633] to-[#1D546D] flex items-center justify-center border border-white/10 text-[10px] font-black text-white/60">
                                            {client.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[#FFFFFF] font-bold text-sm tracking-tight">{client.name}</p>
                                            <p className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest mt-0.5">Saldo Deudor</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-amber-500 tracking-tighter leading-none">
                                            {formatCurrencyARS(client.balance)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {debtStats.topDebtors.length === 0 && (
                                <div className="h-32 flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-white/10 rounded-3xl">
                                    <Users className="h-8 w-8 mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Sin deudas pendientes</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Visión Estratégica */}
            <div className="premium-card p-10 bg-linear-to-r from-[#1D546D]/20 to-transparent border-l-4 border-l-[#75B9BE]">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-[#75B9BE]" />
                            <h4 className="text-lg font-black text-[#FFFFFF] uppercase tracking-widest">Visión Estratégica</h4>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed font-medium">
                            {healthStats.score === 0 ? (
                                "El sistema requiere datos de ventas y stock para generar un análisis comparativo. Comience a registrar operaciones para activar los indicadores de performance."
                            ) : (
                                `La distribución actual de activos muestra una eficiencia de rotación del ${healthStats.score}%. Basado en las ventas del último mes, su inventario tiene un flujo ${healthStats.status.toLowerCase()}. Se recomienda monitorear los productos de baja rotación para optimizar el capital inmovilizado.`
                            )}
                        </p>
                    </div>
                    <div className="h-24 w-px bg-white/10 hidden md:block" />
                    <div className="grid grid-cols-2 gap-8 shrink-0">
                        <div>
                            <p className="text-[10px] font-black text-[#75B9BE] uppercase tracking-[0.2em] mb-1">Score de Eficiencia</p>
                            <p className="text-3xl font-black text-white tracking-tighter">{healthStats.score}%</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#75B9BE] uppercase tracking-[0.2em] mb-1">Índice de Salud</p>
                            <p className={`text-3xl font-black tracking-tighter ${healthStats.score > 40 ? 'text-emerald-400' : 'text-amber-500'}`}>
                                {healthStats.status}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
