const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.cashClosing.findMany({
    orderBy: { openedAt: "desc" },
  });
  console.log("--- CASH CLOSING SESSIONS ---");
  sessions.forEach((s) => {
    console.log(
      `ID: ${s.id} | Status: ${s.status} | Opened: ${s.openedAt} | Closed: ${s.closedAt}`
    );
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
