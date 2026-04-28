import { PrismaClient } from "@prisma/client";
import { seedSteelShapes } from "../src/domain/steel-shapes";

const prisma = new PrismaClient();

async function main() {
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
