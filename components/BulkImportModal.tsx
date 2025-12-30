"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2, ChevronRight, Table, Check } from "lucide-react";
import * as XLSX from "xlsx";
import { importProductsBulk } from "@/app/actions/import-products";

interface BulkImportModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

// CAMPOS DESTINO EN EL ERP
const ERP_FIELDS = [
    { key: "sku", label: "SKU / CÓDIGO SISTEMA", required: true },
    { key: "name", label: "NOMBRE / DESCRIPCIÓN", required: false },
    { key: "category", label: "CATEGORÍA", required: false },
    { key: "purchasePrice", label: "PRECIO COMPRA (COSTO)", required: false },
    { key: "priceList", label: "PRECIO VENTA (NETO)", required: false },
    { key: "stockActual", label: "STOCK ACTUAL", required: false },
    { key: "factoryCode", label: "CÓDIGO DE FÁBRICA", required: false },
    { key: "supplier", label: "PROVEEDOR", required: false },
    { key: "stockMin", label: "STOCK MÍNIMO", required: false },
    { key: "location", label: "UBICACIÓN FÍSICA", required: false },
    { key: "brand", label: "MARCA / COMPATIBILIDAD", required: false },
];

export default function BulkImportModal({ onClose, onSuccess }: BulkImportModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [rawData, setRawData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({}); // ExcelHeader -> erpKey
    const [isImporting, setIsImporting] = useState(false);
    const [results, setResults] = useState<{ created: number, updated: number, errors: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setRawData([]);
        setMapping({});
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            if (data.length > 0) {
                const headerRow = (data[0] as any[]).map(h => h?.toString().trim() || "").filter(h => h !== "");
                setHeaders(headerRow);
                setRawData(data.slice(1));
                setStep(2);

                const initialMapping: Record<string, string> = {};
                headerRow.forEach((h) => {
                    const cleanH = h.toLowerCase();
                    if (cleanH.includes("sku") || cleanH.includes("codigo") || cleanH === "cod") initialMapping[h] = "sku";
                    else if (cleanH.includes("fabrica") || cleanH.includes("fac")) initialMapping[h] = "factoryCode";
                    else if (cleanH.includes("nombre") || cleanH.includes("descrip") || cleanH.includes("articulo")) initialMapping[h] = "name";
                    else if (cleanH.includes("categ")) initialMapping[h] = "category";
                    else if (cleanH.includes("proveedor") || cleanH.includes("prov")) initialMapping[h] = "supplier";
                    else if (cleanH.includes("compra") || cleanH.includes("costo") || cleanH === "cp") initialMapping[h] = "purchasePrice";
                    else if (cleanH.includes("venta") || cleanH.includes("lista") || cleanH === "pv") initialMapping[h] = "priceList";
                    else if (cleanH.includes("stock") || cleanH.includes("cant")) initialMapping[h] = "stockActual";
                    else if (cleanH.includes("min")) initialMapping[h] = "stockMin";
                    else if (cleanH.includes("ubic") || cleanH.includes("estante")) initialMapping[h] = "location";
                    else if (cleanH.includes("marca") || cleanH.includes("vehiculo")) initialMapping[h] = "brand";
                });
                setMapping(initialMapping);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleMappingChange = (excelHeader: string, erpKey: string) => {
        setMapping(prev => ({ ...prev, [excelHeader]: erpKey }));
    };

    // Validar si los campos requeridos del ERP están cubiertos por el mapeo
    const requiredFieldsCovered = ERP_FIELDS.filter(f => f.required).every(f =>
        Object.values(mapping).includes(f.key)
    );

    const processImport = async () => {
        setIsImporting(true);

        const mappedProducts = rawData.map(row => {
            const product: any = {};

            // Solo procesar lo que el usuario mapeó explícitamente
            headers.forEach((h, idx) => {
                const erpKey = mapping[h];
                if (erpKey) {
                    let value = row[idx];
                    if (["priceList", "purchasePrice", "stockActual", "stockMin"].includes(erpKey)) {
                        if (typeof value === "string") {
                            value = value.replace(/\./g, "").replace(",", ".");
                            value = parseFloat(value.replace(/[^0-9.]/g, ""));
                        }
                        if (value !== undefined && value !== "") {
                            product[erpKey] = isNaN(Number(value)) ? 0 : Number(value);
                        }
                    } else if (value !== undefined && value !== "") {
                        product[erpKey] = value.toString();
                    }
                }
            });
            return product;
        }).filter(p => !!p.sku);

        try {
            const res = await importProductsBulk(mappedProducts);
            if (res.success && res.summary) {
                setResults(res.summary);
                setStep(3);
            } else {
                alert(res.error || "Error durante la importación.");
            }
        } catch (err) {
            alert("Error crítico de comunicación.");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="bg-[#04141C] border border-[#1D546D]/50 w-full max-w-6xl max-h-[95vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl border-premium">

                {/* HEAD */}
                <div className="p-8 border-b border-[#1D546D]/20 flex justify-between items-center bg-[#061E29]/80">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-[#75B9BE]/10 flex items-center justify-center text-[#75B9BE] border border-[#75B9BE]/30">
                            <Table className="h-7 w-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#FFFFFF] tracking-tighter uppercase leading-none">
                                Configuración de <span className="text-[#75B9BE]">Columnas</span>
                            </h2>
                            <p className="text-[#75B9BE]/60 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Mapea tu Excel al Sistema</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-[#0A2633] text-[#75B9BE] hover:text-white rounded-2xl transition-all border border-[#1D546D]/30">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#04141C]">
                    {step === 1 && (
                        <div className="h-full flex flex-col items-center justify-center py-20">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full max-w-xl aspect-video border-2 border-dashed border-[#1D546D]/40 rounded-4xl flex flex-col items-center justify-center gap-8 cursor-pointer hover:border-[#75B9BE] hover:bg-[#75B9BE]/5 transition-all group"
                            >
                                <div className="h-28 w-28 rounded-[2.5rem] bg-[#0A2633] border border-[#1D546D]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <Upload className="h-12 w-12 text-[#75B9BE]" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[#FFFFFF] font-black uppercase tracking-[0.2em] text-xl">Carga tu Excel o CSV</p>
                                    <p className="text-[12px] text-[#75B9BE]/60 font-medium mt-3 uppercase tracking-widest">Soportamos todos los formatos de columnas</p>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            {/* MAPPING LIST */}
                            <div className="lg:col-span-8 space-y-6">
                                <div className="bg-[#0A2633]/60 p-6 rounded-3xl border border-[#1D546D]/20 mb-8 flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-black uppercase text-sm">{rawData.length} artículos detectados</p>
                                        <p className="text-[10px] text-[#75B9BE] font-bold uppercase tracking-widest">Asigna cada columna a un campo del ERP</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {ERP_FIELDS.filter(f => f.required).map(f => {
                                            const isMapped = Object.values(mapping).includes(f.key);
                                            return (
                                                <div key={f.key} title={f.label} className={`h-8 px-3 rounded-lg flex items-center gap-2 border ${isMapped ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                                                    {isMapped ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                                    <span className="text-[9px] font-black uppercase">{f.key}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {headers.map((header) => (
                                        <div key={header} className="bg-[#0A2633]/30 border border-[#1D546D]/20 p-5 rounded-2xl flex flex-col gap-3 group hover:border-[#75B9BE]/40 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-2 rounded-full bg-[#75B9BE]" />
                                                <label className="text-[11px] font-black text-white uppercase truncate">{header}</label>
                                            </div>
                                            <select
                                                value={mapping[header] || ""}
                                                onChange={(e) => handleMappingChange(header, e.target.value)}
                                                className="w-full bg-[#061E29] border border-[#1D546D]/60 text-[#FFFFFF] font-bold p-4 rounded-xl outline-none focus:border-[#75B9BE] transition-all text-xs appearance-none cursor-pointer"
                                            >
                                                <option value="">-- Ignorar esta columna --</option>
                                                {ERP_FIELDS.map(f => (
                                                    <option key={f.key} value={f.key}>
                                                        {f.label} {f.required ? "*" : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PREVIEW & INFO */}
                            <div className="lg:col-span-4 space-y-6">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest ml-1">Vista Previa Original</h3>
                                <div className="border border-[#1D546D]/30 rounded-3xl overflow-hidden bg-[#0A2633]/40 shadow-2xl">
                                    <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                                        <table className="w-full text-left">
                                            <thead className="bg-[#1D546D]/40 sticky top-0">
                                                <tr>
                                                    {headers.slice(0, 3).map(h => <th key={h} className="p-4 text-[9px] font-black text-[#75B9BE] uppercase">{h}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rawData.slice(0, 15).map((row, i) => (
                                                    <tr key={i} className="border-b border-[#1D546D]/10 text-[10px] text-white/40 font-bold uppercase">
                                                        {headers.slice(0, 3).map((_, j) => <td key={j} className="p-4 truncate max-w-[100px]">{row[j]?.toString() || "-"}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl flex gap-4">
                                    <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
                                    <p className="text-[10px] text-amber-500/80 font-bold uppercase leading-relaxed">
                                        Asegúrate de mapear al menos los campos con * (asterisco) para que la importación sea exitosa.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && results && (
                        <div className="h-full flex flex-col items-center justify-center space-y-12">
                            <CheckCircle2 className="h-32 w-32 text-emerald-400" />
                            <div className="text-center">
                                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Importación Completada</h3>
                                <div className="grid grid-cols-3 gap-6 mt-10 w-full max-w-xl">
                                    <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                                        <p className="text-5xl font-black text-emerald-400">{results.created}</p>
                                        <p className="text-[10px] font-black text-emerald-400/60 uppercase mt-2">Nuevos</p>
                                    </div>
                                    <div className="p-8 rounded-3xl bg-[#0A2633] border border-[#1D546D]/40 text-center">
                                        <p className="text-5xl font-black text-white">{results.updated}</p>
                                        <p className="text-[10px] font-black text-[#75B9BE] uppercase mt-2">Actualizados</p>
                                    </div>
                                    <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/30 text-center">
                                        <p className="text-5xl font-black text-red-500">{results.errors}</p>
                                        <p className="text-[10px] font-black text-red-500/60 uppercase mt-2">Errores</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onSuccess} className="px-16 py-6 bg-[#75B9BE] text-[#061E29] rounded-3xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-2xl">
                                Finalizar y Volver
                            </button>
                        </div>
                    )}
                </div>

                {/* FOOTER STEP 2 */}
                {step === 2 && (
                    <div className="p-8 border-t border-[#1D546D]/20 bg-[#061E29] flex justify-between items-center">
                        <p className={`text-xs font-black uppercase tracking-widest ${requiredFieldsCovered ? "text-emerald-400" : "text-red-400"}`}>
                            {requiredFieldsCovered ? "✓ Todo listo para importar" : "⚠ Faltan campos obligatorios por mapear"}
                        </p>
                        <button
                            onClick={processImport}
                            disabled={isImporting || !requiredFieldsCovered}
                            className="bg-[#75B9BE] text-[#061E29] font-black uppercase text-sm tracking-widest px-16 py-6 rounded-2xl hover:bg-white transition-all shadow-2xl disabled:opacity-50 disabled:grayscale"
                        >
                            {isImporting ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "Iniciar Importación Final"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
