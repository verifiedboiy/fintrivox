import prisma from './src/config/db.js';
async function main() {
    try {
        const plansCount = await prisma.investmentPlan.count();
        const plans = await prisma.investmentPlan.findMany();
        console.log('Plans count:', plansCount);
        console.log('Plans:', JSON.stringify(plans, null, 2));
    } catch (e) {
        console.error(e);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
