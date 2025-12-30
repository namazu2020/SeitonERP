import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding data...");

    // Clear existing data
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.product.deleteMany();
    await prisma.client.deleteMany();
    await prisma.cashMovement.deleteMany();
    await prisma.config.upsert({
        where: { id: "default" },
        update: {},
        create: {
            id: "default",
            companyName: "Seiton Motors",
            taxId: "30-71458962-0",
            address: "Av. Juan B. Justo 4500, CABA",
            phone: "+54 11 4555-0123",
            email: "ventas@seitonmotors.com.ar",
        },
    });

    // Create Clients
    await prisma.client.create({
        data: {
            name: "Juan Pérez",
            taxId: "20-30456789-5",
            taxCondition: "Consumidor Final",
            address: "Siempreviva 742",
            phone: "1165432109",
        },
    });

    await prisma.client.create({
        data: {
            name: "Taller Mecánico El Rayo",
            taxId: "30-58964712-3",
            taxCondition: "Responsable Inscripto",
            address: "Av. Mitre 1200, Avellaneda",
            phone: "1142013344",
        },
    });

    // Create Products
    const products = [
        {
            sku: "FIL-OIL-001",
            name: "Filtro de Aceite PH4967",
            category: "Filtros",
            stockActual: 50,
            stockMin: 10,
            location: "Pasillo A - Estante 1",
            priceList: 4500.0,
            compatibility: JSON.stringify([
                { brand: "Toyota", model: "Corolla", year_start: 2012, year_end: 2022 },
            ]),
        },
        {
            sku: "PAS-FRE-002",
            name: "Pastillas de Freno Delanteras",
            category: "Frenos",
            stockActual: 20,
            stockMin: 5,
            location: "Pasillo B - Estante 4",
            priceList: 12500.0,
            compatibility: JSON.stringify([
                { brand: "Volkswagen", model: "Gol Trend", year_start: 2008, year_end: 2023 },
            ]),
        },
        {
            sku: "DIS-FRE-003",
            name: "Disco de Freno Ranurado (Par)",
            category: "Frenos",
            stockActual: 10,
            stockMin: 2,
            location: "Pasillo B - Estante 5",
            priceList: 28000.0,
            compatibility: JSON.stringify([
                { brand: "Ford", model: "Focus III", year_start: 2013, year_end: 2019 },
            ]),
        },
        {
            sku: "AMOR-TRA-004",
            name: "Amortiguador Trasero Monroe",
            category: "Suspensión",
            stockActual: 15,
            stockMin: 4,
            location: "Pasillo C - Estante 1",
            priceList: 18500.0,
            compatibility: JSON.stringify([
                { brand: "Chevrolet", model: "Cruze", year_start: 2016, year_end: 2023 },
            ]),
        },
        {
            sku: "COR-DIS-005",
            name: "Correa de Distribución Gates",
            category: "Motor",
            stockActual: 8,
            stockMin: 3,
            location: "Pasillo A - Estante 10",
            priceList: 9800.0,
            compatibility: JSON.stringify([
                { brand: "Fiat", model: "Cronos", year_start: 2018, year_end: 2024 },
            ]),
        },
    ];

    for (const productData of products) {
        const p = await prisma.product.create({
            data: productData,
        });

        if (p.stockActual > 0) {
            await prisma.stockMovement.create({
                data: {
                    productId: p.id,
                    type: "IN",
                    quantity: p.stockActual,
                    reason: "Stock Inicial (Seed)",
                }
            });
        }
    }

    // Create Users
    const bcrypt = require("bcryptjs");
    const passwordHash = await bcrypt.hash("admin123", 10);
    const passwordHashEmp = await bcrypt.hash("empleado123", 10);

    await prisma.user.create({
        data: {
            username: "admin",
            password: passwordHash,
            role: "ADMIN",
            name: "Administrador Seiton"
        }
    });

    await prisma.user.create({
        data: {
            username: "empleado",
            password: passwordHashEmp,
            role: "EMPLOYEE",
            name: "Vendedor P1"
        }
    });

    console.log("Seeding completed successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
