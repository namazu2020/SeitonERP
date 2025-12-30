"use server";

import prisma from "@/lib/prisma";
import { getArgentinaDate, round } from "@/utils/formatters";

/**
 * Sales Statistics for charts
 */
export async function getSalesStats(range: 'week' | 'month' = 'week') {
    const now = getArgentinaDate();
    const startDate = new Date(now);

    if (range === 'week') {
        startDate.setDate(now.getDate() - 7);
    } else {
        startDate.setMonth(now.getMonth() - 1);
    }
    startDate.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: 'asc' }
    });

    const grouped: Record<string, number> = {};
    sales.forEach(sale => {
        const date = sale.createdAt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
        grouped[date] = round((grouped[date] || 0) + sale.total);
    });

    return Object.entries(grouped).map(([date, total]) => ({ date, total }));
}

/**
 * Cash Flow (Income vs Expense) from manual movements and sales
 */
export async function getCashFlowStats(range: 'week' | 'month' = 'week') {
    const now = getArgentinaDate();
    const startDate = new Date(now);

    if (range === 'week') {
        startDate.setDate(now.getDate() - 7);
    } else {
        startDate.setMonth(now.getMonth() - 1);
    }
    startDate.setHours(0, 0, 0, 0);

    const movements = await prisma.cashMovement.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, type: true, amount: true },
        orderBy: { createdAt: 'asc' }
    });

    const grouped: Record<string, { income: number; expense: number }> = {};
    movements.forEach(m => {
        const date = m.createdAt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
        if (!grouped[date]) grouped[date] = { income: 0, expense: 0 };

        if (m.type === "INCOME") grouped[date].income = round(grouped[date].income + m.amount);
        else grouped[date].expense = round(grouped[date].expense + m.amount);
    });

    return Object.entries(grouped).map(([date, values]) => ({
        date,
        income: values.income,
        expense: values.expense
    }));
}

/**
 * Top selling products
 */
export async function getTopProducts(limit = 5) {
    const items = await prisma.saleItem.groupBy({
        by: ['productId', 'name'],
        _sum: {
            quantity: true,
            totalAtSale: true
        },
        orderBy: {
            _sum: { quantity: 'desc' }
        },
        take: limit
    });

    return items.map(item => ({
        name: item.name,
        quantity: item._sum.quantity || 0,
        total: round(item._sum.totalAtSale || 0)
    }));
}

/**
 * Stock valuation and distribution
 */
export async function getStockValuation() {
    const products = await prisma.product.findMany({
        select: {
            stockActual: true,
            priceList: true,
            ivaRate: true,
            category: true
        }
    });

    let totalItems = 0;
    let totalValueRetail = 0;
    const byCategory: Record<string, number> = {};

    products.forEach(p => {
        const retailPrice = p.priceList * (1 + (p.ivaRate / 100));
        const val = p.stockActual * retailPrice;

        totalItems += p.stockActual;
        totalValueRetail = round(totalValueRetail + val);

        const cat = p.category || "Otros";
        byCategory[cat] = round((byCategory[cat] || 0) + val);
    });

    const categoryData = Object.entries(byCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    return { totalItems, totalValueRetail, categoryData };
}

/**
 * Client debt summary (Current Accounts)
 */
export async function getClientDebtStats() {
    const clients = await prisma.client.findMany({
        where: { currentAccountBalance: { gt: 0 } },
        select: { name: true, currentAccountBalance: true },
        orderBy: { currentAccountBalance: 'desc' },
        take: 5
    });

    const totalDebt = await prisma.client.aggregate({
        _sum: { currentAccountBalance: true }
    });

    return {
        topDebtors: clients.map(c => ({ name: c.name, balance: c.currentAccountBalance })),
        totalDebt: round(totalDebt._sum.currentAccountBalance || 0)
    };
}

/**
 * Business Health and Efficiency Score based on real data
 */
export async function getBusinessHealthStats() {
    const now = getArgentinaDate();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // 1. Sales rotation: Sales in last 30 days vs total current stock value
    const salesLastMonth = await prisma.sale.aggregate({
        where: { createdAt: { gte: thirtyDaysAgo } },
        _sum: { total: true }
    });

    const products = await prisma.product.findMany({
        select: { stockActual: true, priceList: true, ivaRate: true }
    });

    const totalStockValue = products.reduce((acc, p) => {
        const retailPrice = p.priceList * (1 + (p.ivaRate / 100));
        return acc + (p.stockActual * retailPrice);
    }, 0);

    const monthlySales = salesLastMonth._sum.total || 0;

    // Efficiency = Sales / (Sales + StockValue) * 100
    // If you sell all stock every month, you are very efficient.
    let efficiencyScore = 0;
    if (totalStockValue > 0 || monthlySales > 0) {
        efficiencyScore = (monthlySales / (monthlySales + (totalStockValue / 2))) * 100;
    }

    // Cap efficiency at 100 for display
    efficiencyScore = Math.min(round(efficiencyScore), 100);

    let healthStatus = "SIN DATOS";
    if (efficiencyScore > 80) healthStatus = "EXCELENTE";
    else if (efficiencyScore > 60) healthStatus = "OPTIMO";
    else if (efficiencyScore > 40) healthStatus = "ESTABLE";
    else if (efficiencyScore > 20) healthStatus = "REVISION";
    else if (totalStockValue > 0 || monthlySales > 0) healthStatus = "CRITICO";

    return {
        score: efficiencyScore,
        status: healthStatus
    };
}
