const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanData() {
  console.log("🚀 Starting database cleanup...");

  try {
    // Delete in order to satisfy foreign key constraints
    const tab1 = await prisma.saleItem.deleteMany();
    console.log(`✅ Deleted ${tab1.count} SaleItems`);

    const tab2 = await prisma.clientTransaction.deleteMany();
    console.log(`✅ Deleted ${tab2.count} ClientTransactions`);

    const tab3 = await prisma.stockMovement.deleteMany();
    console.log(`✅ Deleted ${tab3.count} StockMovements`);

    const tab4 = await prisma.cashMovement.deleteMany();
    console.log(`✅ Deleted ${tab4.count} CashMovements`);

    const tab5 = await prisma.sale.deleteMany();
    console.log(`✅ Deleted ${tab5.count} Sales`);

    const tab6 = await prisma.cashClosing.deleteMany();
    console.log(`✅ Deleted ${tab6.count} CashClosings`);

    console.log("✨ Database cleanup finished successfully.");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanData();
