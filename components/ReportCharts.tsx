"use client";

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { formatCurrencyARS } from "@/utils/formatters";

const COLORS = ['#75B9BE', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

interface ChartProps {
    salesData: any[];
    cashFlowData: any[];
    stockData: any[];
}

export default function ReportCharts({ salesData, cashFlowData, stockData }: ChartProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Trend - Area Chart */}
            <div className="premium-card p-1 rounded-[2.5rem]">
                <div className="bg-[#061E29] p-8 rounded-[calc(2.5rem-4px)] h-full border border-[#1D546D]/20 shadow-2xl">
                    <h3 className="text-lg font-black text-[#FFFFFF] mb-8 uppercase tracking-widest">
                        Tendencia de Ventas
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#75B9BE" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#75B9BE" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1D546D" opacity={0.2} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#75B9BE"
                                    fontSize={10}
                                    fontWeight="bold"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#75B9BE"
                                    fontSize={10}
                                    fontWeight="bold"
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0A2633',
                                        border: '1px solid #1D546D',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                                        padding: '12px'
                                    }}
                                    labelStyle={{ color: '#FFFFFF', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid #1D546D', paddingBottom: '4px' }}
                                    itemStyle={{ fontWeight: 'bold', fontSize: '13px', color: '#FFFFFF' }}
                                    formatter={(value: any) => [formatCurrencyARS(Number(value)), ""]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#75B9BE"
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Cash Flow - Comparison Bar Chart */}
            <div className="premium-card p-1 rounded-[2.5rem]">
                <div className="bg-[#061E29] p-8 rounded-[calc(2.5rem-4px)] h-full border border-[#1D546D]/20 shadow-2xl">
                    <h3 className="text-lg font-black text-[#FFFFFF] mb-8 uppercase tracking-widest">
                        Flujo de Caja (Ingresos vs Egresos)
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cashFlowData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1D546D" opacity={0.2} vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#75B9BE"
                                    fontSize={10}
                                    fontWeight="bold"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0A2633',
                                        border: '1px solid #1D546D',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                                        padding: '12px'
                                    }}
                                    labelStyle={{ color: '#FFFFFF', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid #1D546D', paddingBottom: '4px' }}
                                    itemStyle={{ fontWeight: 'bold', fontSize: '13px', color: '#FFFFFF' }}
                                    cursor={{ fill: '#1D546D', opacity: 0.1 }}
                                    formatter={(value: any) => [formatCurrencyARS(Number(value)), ""]}
                                />
                                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Ingresos" />
                                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Egresos" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Stock Distribution - Pie Chart */}
            <div className="premium-card p-1 rounded-[2.5rem]">
                <div className="bg-[#061E29] p-8 rounded-[calc(2.5rem-4px)] h-full border border-[#1D546D]/20 shadow-2xl">
                    <h3 className="text-lg font-black text-[#FFFFFF] mb-8 uppercase tracking-widest">
                        Distribución de Stock por Categoría
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stockData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {stockData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0A2633',
                                        border: '1px solid #1D546D',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                                        padding: '12px'
                                    }}
                                    labelStyle={{ display: 'none' }} // Pie charts use the item name as label
                                    itemStyle={{ fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', color: '#FFFFFF' }}
                                    formatter={(value: any, name: string | undefined) => [formatCurrencyARS(Number(value)), name || ""]}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    align="center"
                                    iconType="circle"
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    formatter={(value) => <span style={{ color: '#FFFFFF', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Performance Note */}
            <div className="premium-card p-8 rounded-[2.5rem] bg-linear-to-br from-[#1D546D]/20 to-transparent flex flex-col justify-center">
                <h4 className="text-xl font-black text-[#75B9BE] mb-4 uppercase tracking-tighter">ANÁLISIS DE EFICIENCIA</h4>
                <p className="text-sm text-[#FFFFFF]/80 leading-relaxed font-medium">
                    Monitorice el equilibrio entre sus ingresos operativos y los egresos de caja chica.
                    Un flujo de caja saludable mantiene los ingresos por encima de los egresos en una proporción de al menos 2:1.
                    <br /><br />
                    La valuación de stock representa el capital inmovilizado. Optimice su rotación enfocándose en los "Best Sellers".
                </p>
                <div className="mt-6 h-1 w-24 bg-[#75B9BE] rounded-full" />
            </div>
        </div>
    );
}
