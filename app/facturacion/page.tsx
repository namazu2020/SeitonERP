import { getSalesHistory, getInvoiceConfig } from "@/app/actions/billing";
import SalesTable from "@/components/SalesTable";
import { FileText, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const resolvedParams = await searchParams;
    const query = resolvedParams?.q || "";
    const sales = await getSalesHistory(query);
    const config = await getInvoiceConfig();

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-[#FFFFFF] uppercase">
                        Gestión de <span className="text-[#75B9BE]">Facturación</span>
                    </h1>
                    <p className="text-[#75B9BE] font-bold mt-2 uppercase tracking-[0.2em] text-xs">Historial de ventas y comprobantes</p>
                </div>

                <div className="flex items-center gap-3 bg-[#1D546D]/20 px-6 py-3 rounded-2xl border border-[#1D546D]/30 shadow-inner">
                    <FileText className="h-5 w-5 text-[#75B9BE]" />
                    <span className="text-sm font-black text-[#FFFFFF] uppercase tracking-wider">
                        {sales.length} Comprobantes
                    </span>
                </div>
            </div>

            {/* Search Bar (Server Side via URL Params ideally, or handled in client comp - here we passed q so lets make a simple form) */}
            <div className="premium-card p-2 rounded-3xl bg-[#0A2633]/30 border border-[#1D546D]/20 flex items-center">
                <form className="flex-1 relative" action="/facturacion">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#1D546D]" />
                    <input
                        name="q"
                        defaultValue={query}
                        placeholder="Buscar por número de factura o cliente..."
                        className="w-full bg-transparent border-none py-4 pl-16 pr-6 text-[#FFFFFF] font-bold placeholder:text-[#1D546D] outline-none"
                    />
                </form>
            </div>

            {/* Sales Table Area */}
            <div className="premium-card p-1 rounded-[2.5rem] bg-linear-to-b from-[#1D546D]/20 to-transparent">
                <div className="bg-[#04141C] rounded-[calc(2.5rem-4px)] overflow-hidden shadow-2xl min-h-[500px]">
                    <SalesTable sales={sales} config={config} />
                </div>
            </div>
        </div>
    );
}
