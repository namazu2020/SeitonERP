const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanup() {
  console.log("Starting Database Cleanup & Optimization...");

  // 1. Get the admin user
  const admin = await prisma.user.findUnique({ where: { username: "admin" } });
  if (!admin) {
    console.error("Admin user not found. Please seed the database first.");
    return;
  }

  // 2. Assign User to existing records
  console.log("Assigning admin as author for existing records...");

  await prisma.sale.updateMany({
    where: { userId: null },
    data: { userId: admin.id },
  });

  await prisma.cashMovement.updateMany({
    where: { userId: null },
    data: { userId: admin.id },
  });

  await prisma.cashClosing.updateMany({
    where: { userId: null },
    data: { userId: admin.id },
  });

  await prisma.clientTransaction.updateMany({
    where: { userId: null },
    data: { userId: admin.id },
  });

  // 3. Link Movements to Closings
  console.log("Linking movements to their respective cash sessions...");
  const closings = await prisma.cashClosing.findMany({
    orderBy: { openedAt: "asc" },
  });

  const movements = await prisma.cashMovement.findMany({
    where: { closingId: null },
  });

  for (const mov of movements) {
    // Find a closing that was open when the movement happened
    const session = closings.find(
      (c) =>
        mov.createdAt >= c.openedAt &&
        (!c.closedAt || mov.createdAt <= c.closedAt)
    );

    if (session) {
      await prisma.cashMovement.update({
        where: { id: mov.id },
        data: { closingId: session.id },
      });
    } else {
      // If no matching session, link to the last one or stay null
      const lastSession = closings.findLast((c) => mov.createdAt >= c.openedAt);
      if (lastSession) {
        await prisma.cashMovement.update({
          where: { id: mov.id },
          data: { closingId: lastSession.id },
        });
      }
    }
  }

  console.log("Cleanup complete!");
}

cleanup()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
