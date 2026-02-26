import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
    console.log('🌱 Seeding database...\n');

    // ---- Only seed if database is empty (idempotent) ----
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
        console.log('   ⚠️  Database already has data. Skipping seed to preserve existing users.');
        console.log('   💡 To force re-seed, run: npx prisma db push --force-reset && npm run db:seed\n');
        return;
    }

    console.log('   Database is empty — seeding fresh data...\n');

    // ---- Create Users ----
    const adminHash = await bcrypt.hash('Admin@123', 12);
    const userHash = await bcrypt.hash('User@123', 12);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@xvbwallet.com',
            passwordHash: adminHash,
            firstName: 'System',
            lastName: 'Administrator',
            phone: '+1 (555) 000-0001',
            country: 'United States',
            balance: 1000000,
            availableBalance: 1000000,
            role: 'ADMIN',
            status: 'ACTIVE',
            emailVerified: true,
            kycStatus: 'VERIFIED',
            referralCode: 'ADMIN2024',
        },
    });
    console.log(`   ✅ Admin: ${admin.email} (password: Admin@123)`);

    const john = await prisma.user.create({
        data: {
            email: 'john.doe@example.com',
            passwordHash: userHash,
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1 (555) 123-4567',
            country: 'United States',
            balance: 45000,
            availableBalance: 20000,
            investedAmount: 25000,
            totalProfit: 3500,
            totalDeposited: 50000,
            totalWithdrawn: 8500,
            role: 'USER',
            status: 'ACTIVE',
            emailVerified: true,
            twoFactorEnabled: false,
            kycStatus: 'VERIFIED',
            kycSubmittedAt: new Date('2024-02-16'),
            referralCode: 'JOHN2024',
            withdrawalKey: 'WITHDRAW-JOHN-002',
        },
    });
    console.log(`   ✅ User: ${john.email} (password: User@123)`);

    const sarah = await prisma.user.create({
        data: {
            email: 'sarah.smith@example.com',
            passwordHash: userHash,
            firstName: 'Sarah',
            lastName: 'Smith',
            phone: '+44 20 7946 0958',
            country: 'United Kingdom',
            balance: 12500,
            availableBalance: 12500,
            totalDeposited: 15000,
            role: 'USER',
            status: 'ACTIVE',
            emailVerified: true,
            kycStatus: 'PENDING',
            kycSubmittedAt: new Date('2024-03-01'),
            referralCode: 'SARAH2024',
        },
    });
    console.log(`   ✅ User: ${sarah.email} (password: User@123)`);

    const mike = await prisma.user.create({
        data: {
            email: 'mike.jones@example.com',
            passwordHash: userHash,
            firstName: 'Mike',
            lastName: 'Jones',
            phone: '+1 (555) 987-6543',
            country: 'Canada',
            balance: 500,
            availableBalance: 500,
            totalDeposited: 500,
            role: 'USER',
            status: 'PENDING',
            emailVerified: false,
            kycStatus: 'NOT_SUBMITTED',
            referralCode: 'MIKE2024',
        },
    });
    console.log(`   ✅ User: ${mike.email} (password: User@123)`);

    const emma = await prisma.user.create({
        data: {
            email: 'emma.wilson@example.com',
            passwordHash: userHash,
            firstName: 'Emma',
            lastName: 'Wilson',
            phone: '+61 2 9374 4000',
            country: 'Australia',
            balance: 75000,
            availableBalance: 25000,
            investedAmount: 50000,
            totalProfit: 8750,
            totalDeposited: 100000,
            totalWithdrawn: 33750,
            role: 'USER',
            status: 'ACTIVE',
            emailVerified: true,
            twoFactorEnabled: true,
            kycStatus: 'VERIFIED',
            kycSubmittedAt: new Date('2024-01-21'),
            referralCode: 'EMMA2024',
            withdrawalKey: 'WITHDRAW-EMMA-005',
        },
    });
    console.log(`   ✅ User: ${emma.email} (password: User@123)`);

    // ---- Investment Plans (16-day duration, 0.5% daily) ----
    const cryptoStarter = await prisma.investmentPlan.create({
        data: {
            name: 'Crypto Starter',
            description: 'Perfect for beginners looking to enter the cryptocurrency market with minimal risk.',
            minAmount: 100, maxAmount: 5000,
            dailyProfit: 0.5, monthlyProfit: 15, yearlyProfit: 180,
            duration: 28, referralBonus: 3,
            riskLevel: 'low', category: 'crypto', status: 'active',
            features: ['Daily profit payouts', 'Low minimum investment', 'Bitcoin & Ethereum exposure', 'Risk management', 'Auto-compounding'],
            color: '#8B5CF6',
        },
    });

    const stockGrowth = await prisma.investmentPlan.create({
        data: {
            name: 'Stock Growth',
            description: 'Diversified stock portfolio managed by professional traders.',
            minAmount: 1000, maxAmount: 50000,
            dailyProfit: 0.5, monthlyProfit: 15, yearlyProfit: 180,
            duration: 28, referralBonus: 5,
            riskLevel: 'medium', category: 'stocks', status: 'active',
            features: ['Professional portfolio management', 'Dividend reinvestment', 'Quarterly reports', 'Tax optimization', 'Auto-rebalancing'],
            color: '#3B82F6',
        },
    });

    const forexPro = await prisma.investmentPlan.create({
        data: {
            name: 'Forex Pro',
            description: 'Advanced forex trading with professional traders and AI-powered strategies.',
            minAmount: 5000, maxAmount: 100000,
            dailyProfit: 0.5, monthlyProfit: 15, yearlyProfit: 180,
            duration: 28, referralBonus: 7,
            riskLevel: 'high', category: 'forex', status: 'active',
            features: ['AI-powered trading', 'High frequency execution', 'Risk alerts', '24/5 market access', 'Dedicated account manager'],
            color: '#EF4444',
        },
    });

    const goldSecure = await prisma.investmentPlan.create({
        data: {
            name: 'Gold Secure',
            description: 'Safe investment backed by physical gold reserves.',
            minAmount: 2000, maxAmount: 200000,
            dailyProfit: 0.5, monthlyProfit: 15, yearlyProfit: 180,
            duration: 28, referralBonus: 4,
            riskLevel: 'low', category: 'commodities', status: 'active',
            features: ['Physical gold backing', 'Inflation hedge', 'Secure storage', 'Insurance included', 'Buyback guarantee'],
            color: '#F59E0B', popular: true,
        },
    });

    const elitePortfolio = await prisma.investmentPlan.create({
        data: {
            name: 'Elite Portfolio',
            description: 'Premium diversified investment across all asset classes with highest returns.',
            minAmount: 10000, maxAmount: 500000,
            dailyProfit: 0.5, monthlyProfit: 15, yearlyProfit: 180,
            duration: 28, referralBonus: 10,
            riskLevel: 'high', category: 'mixed', status: 'active',
            features: ['All asset classes', 'Dedicated portfolio manager', 'Weekly reports', 'Priority support', 'Custom strategy'],
            color: '#10B981', popular: true,
        },
    });

    console.log(`   ✅ Created 5 investment plans (28-day duration, 0.5% daily)`);

    // ---- Payment Methods ----
    await prisma.paymentMethod.createMany({
        data: [
            {
                name: 'Bitcoin', type: 'crypto', icon: 'bitcoin',
                minAmount: 50, maxAmount: 1000000, fee: 0, feeType: 'percentage',
                processingTime: '10-30 minutes', supportedCurrencies: ['BTC'],
                walletAddress: 'bc1q0x93ysaw9yf2gzsj6hfxa73yvcfmqftcqywrxs',
            },
            {
                name: 'Ethereum', type: 'crypto', icon: 'ethereum',
                minAmount: 50, maxAmount: 500000, fee: 0, feeType: 'percentage',
                processingTime: '5-15 minutes', supportedCurrencies: ['ETH'],
                walletAddress: '0xf78abb5f48603ca685ebfaa59c8e4c0f19c6a826',
            },
            {
                name: 'USDT (TRC20)', type: 'crypto', icon: 'usdt',
                minAmount: 10, maxAmount: 1000000, fee: 1, feeType: 'fixed',
                processingTime: '1-5 minutes', supportedCurrencies: ['USDT'],
                walletAddress: 'THHhKVobizq64GKsgbvKBYT6E7huzvcBYM',
            },
            {
                name: 'Bank Transfer', type: 'bank', icon: 'bank',
                minAmount: 100, maxAmount: 500000, fee: 0.5, feeType: 'percentage',
                processingTime: '1-3 business days', supportedCurrencies: ['USD', 'EUR', 'GBP'],
                instructions: 'Include your reference number in the transfer description.',
            },
            {
                name: 'Wire Transfer', type: 'bank', icon: 'wire',
                minAmount: 1000, maxAmount: 1000000, fee: 25, feeType: 'fixed',
                processingTime: '2-5 business days', supportedCurrencies: ['USD'],
            },
            {
                name: 'Credit/Debit Card', type: 'card', icon: 'card',
                minAmount: 1, maxAmount: 10000, fee: 2.5, feeType: 'percentage',
                processingTime: 'Instant', supportedCurrencies: ['USD', 'EUR', 'GBP'],
            },
        ],
    });
    console.log(`   ✅ Created 6 payment methods`);

    // ---- Sample Transactions ----
    await prisma.transaction.createMany({
        data: [
            {
                userId: john.id, type: 'DEPOSIT', amount: 25000, status: 'COMPLETED',
                description: 'Initial deposit via Bank Transfer', reference: 'DEP-001',
                method: 'Bank Transfer', fee: 125, netAmount: 24875,
                processedAt: new Date('2024-01-10'),
            },
            {
                userId: john.id, type: 'DEPOSIT', amount: 25000, status: 'COMPLETED',
                description: 'Deposit via Bitcoin', reference: 'DEP-002',
                method: 'Bitcoin', txHash: '0xabc123def456',
                processedAt: new Date('2024-02-01'),
            },
            {
                userId: john.id, type: 'INVESTMENT', amount: 5000, status: 'COMPLETED',
                description: 'Investment in Crypto Starter Plan', reference: 'INV-001',
                processedAt: new Date('2024-01-15'),
            },
            {
                userId: john.id, type: 'INVESTMENT', amount: 20000, status: 'COMPLETED',
                description: 'Investment in Stock Growth Plan', reference: 'INV-002',
                processedAt: new Date('2024-01-20'),
            },
            {
                userId: john.id, type: 'WITHDRAWAL', amount: 5000, status: 'COMPLETED',
                description: 'Withdrawal via Bitcoin', reference: 'WDR-001',
                method: 'Bitcoin', processedAt: new Date('2024-03-01'),
            },
            {
                userId: john.id, type: 'PROFIT', amount: 25, status: 'COMPLETED',
                description: 'Daily profit from Crypto Starter Plan', reference: 'PRF-001',
                processedAt: new Date(),
            },
            {
                userId: sarah.id, type: 'DEPOSIT', amount: 15000, status: 'COMPLETED',
                description: 'Deposit via Bank Transfer', reference: 'DEP-003',
                method: 'Bank Transfer', processedAt: new Date('2024-03-05'),
            },
            {
                userId: emma.id, type: 'DEPOSIT', amount: 100000, status: 'COMPLETED',
                description: 'Deposit via Wire Transfer', reference: 'DEP-004',
                method: 'Wire Transfer', processedAt: new Date('2024-01-05'),
            },
            // A pending withdrawal for admin to approve
            {
                userId: emma.id, type: 'WITHDRAWAL', amount: 10000, status: 'PENDING',
                description: 'Withdrawal via Ethereum', reference: 'WDR-002',
                method: 'Ethereum', withdrawalKey: 'WITHDRAW-EMMA-005',
            },
            // A pending deposit for admin to approve
            {
                userId: sarah.id, type: 'DEPOSIT', amount: 5000, status: 'PENDING',
                description: 'Deposit via USDT (TRC20)', reference: 'DEP-005',
                method: 'USDT (TRC20)', txHash: '0xdef789ghi012',
            },
        ],
    });
    console.log(`   ✅ Created 10 sample transactions`);

    // ---- Sample Investments ----
    await prisma.investment.createMany({
        data: [
            {
                userId: john.id, planId: cryptoStarter.id, amount: 5000,
                dailyProfitRate: 0.5, totalProfit: 1250, earnedProfit: 875,
                status: 'ACTIVE',
                startDate: new Date('2024-01-15'), endDate: new Date('2025-01-15'),
                nextProfitDate: new Date(Date.now() + 86400000),
            },
            {
                userId: john.id, planId: stockGrowth.id, amount: 20000,
                dailyProfitRate: 0.5, totalProfit: 6400, earnedProfit: 2625,
                status: 'ACTIVE',
                startDate: new Date('2024-01-20'), endDate: new Date('2025-01-20'),
                nextProfitDate: new Date(Date.now() + 86400000),
            },
            {
                userId: emma.id, planId: elitePortfolio.id, amount: 50000,
                dailyProfitRate: 0.5, totalProfit: 11250, earnedProfit: 5625,
                status: 'ACTIVE',
                startDate: new Date('2024-02-10'), endDate: new Date('2025-02-10'),
                nextProfitDate: new Date(Date.now() + 86400000),
            },
        ],
    });
    console.log(`   ✅ Created 3 sample investments`);

    // ---- Sample Notifications ----
    await prisma.notification.createMany({
        data: [
            {
                userId: john.id, title: 'Welcome to Fintrivox!',
                message: 'Your account has been created. Complete KYC to unlock all features.',
                type: 'SUCCESS', link: '/dashboard/kyc',
            },
            {
                userId: john.id, title: 'Deposit Confirmed',
                message: 'Your deposit of $25,000 via Bank Transfer has been confirmed.',
                type: 'SUCCESS', read: true,
            },
            {
                userId: john.id, title: 'Daily Profit',
                message: 'You earned $25.00 from Crypto Starter Plan today.',
                type: 'INFO', link: '/dashboard/portfolio',
            },
            {
                userId: sarah.id, title: 'KYC Pending',
                message: 'Your KYC documents are under review. We\'ll notify you once verified.',
                type: 'INFO', link: '/dashboard/kyc',
            },
            {
                userId: emma.id, title: 'Withdrawal Pending',
                message: 'Your withdrawal of $10,000 is pending admin approval.',
                type: 'INFO', link: '/dashboard/transactions',
            },
        ],
    });
    console.log(`   ✅ Created 5 sample notifications`);

    console.log('\n✨ Seed complete!\n');
    console.log('Login credentials:');
    console.log('  Admin: admin@xvbwallet.com / Admin@123');
    console.log('  Demo:  john.doe@example.com / User@123');
    console.log('  User:  sarah.smith@example.com / User@123');
    console.log('  User:  emma.wilson@example.com / User@123\n');
}

seed()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
