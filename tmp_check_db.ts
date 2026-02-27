import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const plansCount = await prisma.investmentPlan.count();
    const plans = await prisma.investmentPlan.findMany();
    console.log('Plans count:', plansCount);
    console.log('Plans:', JSON.stringify(plans, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
