import { PrismaClient } from "@prisma/client";
import { seedSteelShapes } from "../src/domain/steel-shapes";

const prisma = new PrismaClient();

const organizationId = process.env.DEV_ORGANIZATION_ID ?? "00000000-0000-0000-0000-000000000001";
const userId = process.env.DEV_USER_ID ?? "00000000-0000-0000-0000-000000000001";
const organizationName = process.env.ORGANIZATION_NAME ?? "R&R Fabrication";
const userEmail = process.env.DEV_USER_EMAIL ?? "estimator@rrfabrication.local";
const userName = process.env.DEV_USER_NAME ?? "R&R Estimator";

async function main() {
  await prisma.organization.upsert({
    where: { id: organizationId },
    update: { name: organizationName },
    create: { id: organizationId, name: organizationName }
  });

  await prisma.user.upsert({
    where: { id: userId },
    update: { email: userEmail, name: userName },
    create: { id: userId, email: userEmail, name: userName }
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
