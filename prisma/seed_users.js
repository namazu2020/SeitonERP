const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      username: "admin",
      password: "admin123",
      role: "ADMIN",
      name: "Administrador",
    },
    {
      username: "empleado",
      password: "emp123",
      role: "EMPLOYEE",
      name: "Vendedor",
    },
  ];

  console.log("Seeding users...");

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const existing = await prisma.user.findUnique({
      where: { username: u.username },
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          username: u.username,
          password: hashedPassword,
          role: u.role,
          name: u.name,
        },
      });
      console.log(`Created user: ${u.username}`);
    } else {
      // Optional: Update password if needed, or just skip
      console.log(`User ${u.username} already exists.`);
    }
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
