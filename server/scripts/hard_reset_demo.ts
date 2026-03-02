import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'john.doe@example.com';
    const password = 'User@123';
    const passwordHash = await bcrypt.hash(password, 12);

    // Delete if exists to be absolutely sure we have a clean state
    try {
        await prisma.user.delete({ where: { email } });
        console.log('Existing demo user deleted');
    } catch (e) {
        console.log('No existing demo user to delete or delete failed (might be referenced)');
    }

    const demoUser = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash,
            emailVerified: true,
            twoFactorEnabled: false,
            status: 'ACTIVE',
            kycStatus: 'VERIFIED',
            balance: 50000,
            availableBalance: 50000,
            investedAmount: 10000,
            totalProfit: 2500.00
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
            balance: 50000,
            availableBalance: 50000,
            investedAmount: 10000,
            totalProfit: 2500.00
        }
    });

    console.log('Demo user RE-CREATED/UPDATED successfully:', demoUser.email);
    console.log('Password set to: User@123');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
