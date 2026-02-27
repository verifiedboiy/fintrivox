import prisma from './src/config/db.js';
async function main() {
    const plans = await prisma.investmentPlan.findMany();
    console.log('--- INVESTMENT PLANS AUDIT ---');
    console.log(`Total plans: ${plans.length}`);
    plans.forEach(p => {
        console.log(`- [${p.id}] ${p.name}: status="${p.status}", min=${p.minAmount}, max=${p.maxAmount}, daily=${p.dailyProfit}`);
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
