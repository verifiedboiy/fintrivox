import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const methods = await prisma.paymentMethod.findMany();
    console.log(methods);
}

main().finally(() => prisma.$disconnect());
