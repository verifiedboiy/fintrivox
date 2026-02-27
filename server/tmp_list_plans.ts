import prisma from './src/config/db.js';
async function main() {
    const plans = await prisma.investmentPlan.findMany({ select: { name: true, status: true } });
    console.log('Plans:', JSON.stringify(plans, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
