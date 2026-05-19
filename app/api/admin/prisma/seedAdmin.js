const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const admins = [
    { email: "admin@test.com", password: "123456" },
    { email: "superadmin@test.com", password: "123456" },
  ];

  for (let admin of admins) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    await prisma.admin.upsert({
      where: { email: admin.email },
      update: { password: hashedPassword },
      create: { email: admin.email, password: hashedPassword },
    });
  }
  console.log("✅ Admins created/updated");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());