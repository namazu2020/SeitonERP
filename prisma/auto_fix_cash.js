const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Fixing inconsistent cash sessions...");

  // 1. Get all OPEN sessions
  const openSessions = await prisma.cashClosing.findMany({
    where: { status: "OPEN" },
    orderBy: { openedAt: "desc" },
  });

  if (openSessions.length > 1) {
    console.log(
      `Found ${openSessions.length} OPEN sessions. Closing all except the most recent one.`
    );

    // Updates all except [0]
    const idsToClose = openSessions.slice(1).map((s) => s.id);

    await prisma.cashClosing.updateMany({
      where: { id: { in: idsToClose } },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        observations: "Auto-closed by System Integrity Fix",
      },
    });

    console.log(`Closed ${idsToClose.length} ghost sessions.`);
    console.log(`Active session: ${openSessions[0].id}`);
  } else if (openSessions.length === 1) {
    console.log("System integrity check passed: Only 1 active session.");
  } else {
    console.log("No active sessions found.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
