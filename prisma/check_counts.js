const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkCounts() {
  const users = await prisma.user.count();
  const products = await prisma.product.count();
  const clients = await prisma.client.count();
  const sales = await prisma.sale.count();
  const closings = await prisma.cashClosing.count();

  console.log({ users, products, clients, sales, closings });
  await prisma.$disconnect();
}

checkCounts();
