"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Sale, SaleItem, Client } from "@prisma/client";
import { formatCurrencyARS } from "./formatters";

interface FullSale extends Sale {
    client: Client | null;
    items: SaleItem[];
}

export const generateInvoicePDF = (sale: FullSale, config: any) => {
    const doc = new jsPDF();

    // -- Header --
    // Company Info
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(config?.companyName || "SEITON MOTORS", 15, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(config?.address || "Dirección no configurada", 15, 32);
    doc.text(`Tel: ${config?.phone || "-"}`, 15, 37);
    doc.text(`Email: ${config?.email || "-"}`, 15, 42);
    doc.text(`CUIT: ${config?.taxId || "-"}`, 15, 47);

    // Invoice Info Box
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(130, 15, 65, 35, 3, 3, 'F');

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA", 140, 25);

    doc.setFontSize(10);
    doc.text(`N°: ${sale.invoiceNumber}`, 140, 32);
    doc.text(`Fecha: ${new Date(sale.createdAt).toLocaleDateString()}`, 140, 38);
    doc.text(`Tipo: ${sale.invoiceType}`, 140, 44);

    // -- Client Info --
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 55, 195, 55);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENTE", 15, 65);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${sale.client?.name || "consumidor final"}`, 15, 72);
    doc.text(`CUIT/DNI: ${sale.client?.taxId || "-"}`, 15, 77);
    doc.text(`Dirección: ${sale.client?.address || "-"}`, 100, 72);
    doc.text(`Condición IVA: ${sale.client?.taxCondition || "-"}`, 100, 77);

    // -- Items Table --
    const tableColumn = ["SKU", "Descripción", "Cant.", "Precio Unit.", "Subtotal"];
    const tableRows: any[] = [];

    sale.items.forEach((item: SaleItem) => {
        const itemData = [
            item.sku || "-",
            item.name,
            item.quantity,
            formatCurrencyARS(item.priceAtSale),
            formatCurrencyARS(item.totalAtSale)
        ];
        tableRows.push(itemData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 85,
        theme: 'grid',
        headStyles: { fillColor: [6, 30, 41], textColor: [255, 255, 255] }, // Dark theme header
        styles: { fontSize: 9, cellPadding: 3 },
    });

    // -- Totals --
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(formatCurrencyARS(sale.subtotal), 195, finalY, { align: "right" });

    doc.text(`IVA (21%):`, 140, finalY + 6);
    doc.text(formatCurrencyARS(sale.taxAmount), 195, finalY + 6, { align: "right" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL:`, 140, finalY + 14);
    doc.text(formatCurrencyARS(sale.total), 195, finalY + 14, { align: "right" });

    // -- Footer --
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Gracias por su compra.", 105, 280, { align: "center" });
    doc.text("Comprobante generado electrónicamente.", 105, 285, { align: "center" });

    // Save
    doc.save(`Factura_${sale.invoiceNumber}.pdf`);
};
