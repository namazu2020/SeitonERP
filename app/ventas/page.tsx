import prisma from "@/lib/prisma";
import POS from "@/components/POS";
import { isCashBoxOpen } from "@/app/actions/cash";

export const dynamic = "force-dynamic";

export default async function VentasPage() {
    const products = await prisma.product.findMany({
        orderBy: { name: "asc" },
    });

    const clients = await prisma.client.findMany({
        orderBy: { name: "asc" },
    });

    const config = await prisma.config.findUnique({
        where: { id: "default" },
    });

    const isOpen = await isCashBoxOpen();

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Ventas (POS)</h1>
                <p className="text-muted-foreground underline decoration-primary/30 underline-offset-4">
                    Sistema de facturación directa
                </p>
            </div>

            <POS
                products={products}
                clients={clients}
                config={config}
                isCashBoxOpen={isOpen}
            />
        </div>
    );
}
