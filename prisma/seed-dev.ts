import { PrismaClient } from "@prisma/client";
import { seedSteelShapes } from "../src/domain/steel-shapes";

const prisma = new PrismaClient();

const organizationId = process.env.DEV_ORGANIZATION_ID ?? "00000000-0000-0000-0000-000000000001";
const userId = process.env.DEV_USER_ID ?? "00000000-0000-0000-0000-000000000001";

async function main() {
  await prisma.organization.upsert({
    where: { id: organizationId },
    update: { name: "Demo Steel Fabricator" },
    create: { id: organizationId, name: "Demo Steel Fabricator" }
  });

  await prisma.user.upsert({
    where: { id: userId },
    update: { email: "estimator@steelscope.local", name: "Dev Estimator" },
    create: { id: userId, email: "estimator@steelscope.local", name: "Dev Estimator" }
  });

  await prisma.organizationMembership.upsert({
    where: { organizationId_userId: { organizationId, userId } },
    update: { role: "owner" },
    create: { organizationId, userId, role: "owner" }
  });

  for (const shape of seedSteelShapes) {
    await prisma.steelShape.upsert({
      where: { id: shape.id },
      update: shape,
      create: shape
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
