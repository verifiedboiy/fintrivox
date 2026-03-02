import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'john.doe@example.com';
    const password = 'User@123';
    const passwordHash = await bcrypt.hash(password, 12);

    const demoUser = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash,
            emailVerified: true,
            twoFactorEnabled: false,
            status: 'ACTIVE',
            kycStatus: 'VERIFIED'
        },
        create: {
            email,
            passwordHash,
            firstName: 'John',
            lastName: 'Doe',
            emailVerified: true,
            twoFactorEnabled: false,
            status: 'ACTIVE',
            kycStatus: 'VERIFIED',
            balance: 10000,
            availableBalance: 10000,
            investedAmount: 5000,
            totalProfit: 1250.50
        }
    });

    console.log('Demo user updated/created:', demoUser.email);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
