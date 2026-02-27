import prisma from './src/config/db.js';
import bcrypt from 'bcryptjs';

async function main() {
    const email = 'john.doe@example.com';
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: { passwordHash, status: 'ACTIVE', kycStatus: 'VERIFIED' },
        create: {
            email,
            passwordHash,
            firstName: 'John',
            lastName: 'Doe',
            role: 'USER',
            status: 'ACTIVE',
            kycStatus: 'VERIFIED',
            balance: 10000,
            availableBalance: 10000
        },
    });

    console.log(`✅ Demo user ensured: ${user.email} (password: ${password})`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
