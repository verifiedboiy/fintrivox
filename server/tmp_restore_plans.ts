import prisma from './src/config/db.js';

async function main() {
    console.log('🔄 Restoring default plans...');

    const plans = [
        {
            name: 'Starter',
            description: 'Essential plan for stable daily earnings and capital protection.',
            minAmount: 100,
            maxAmount: 999,
            dailyProfit: 0.5,
            monthlyProfit: 15,
            yearlyProfit: 180,
            duration: 28,
            referralBonus: 5,
            riskLevel: 'low',
            category: 'crypto',
            status: 'active',
            features: ['Daily Profit', 'Capital Protection', 'Instant Withdrawal'],
            color: '#8B5CF6', // Violet
            popular: true
        },
        {
            name: 'Growth',
            description: 'Accelerate your wealth with higher returns and managed portfolio benefits.',
            minAmount: 1000,
            maxAmount: 9999,
            dailyProfit: 0.8,
            monthlyProfit: 24,
            yearlyProfit: 292,
            duration: 28,
            referralBonus: 7,
            riskLevel: 'medium',
            category: 'mixed',
            status: 'active',
            features: ['Higher Returns', 'Portfolio Management', 'Priority Support'],
            color: '#3B82F6', // Blue
            popular: false
        },
        {
            name: 'Elite',
            description: 'The ultimate investment choice for maximum returns and exclusive privileges.',
            minAmount: 10000,
            maxAmount: 1000000,
            dailyProfit: 1.5,
            monthlyProfit: 45,
            yearlyProfit: 547.5,
            duration: 28,
            referralBonus: 10,
            riskLevel: 'high',
            category: 'stocks',
            status: 'active',
            features: ['Maximum Returns', 'Dedicated Manager', 'VIP Events'],
            color: '#10B981', // Emerald
            popular: false
        }
    ];

    for (const plan of plans) {
        await prisma.investmentPlan.upsert({
            where: { name: plan.name },
            update: plan,
            create: plan,
        });
        console.log(`✅ Plan restored: ${plan.name}`);
    }

    console.log('✨ All default plans are now active.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
