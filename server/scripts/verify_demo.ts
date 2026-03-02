import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'john.doe@example.com' }
    });
    console.log('--- User Check ---');
    console.log('Email:', user?.email);
    console.log('Status:', user?.status);
    console.log('Verified:', user?.emailVerified);
    console.log('2FA Enabled:', user?.twoFactorEnabled);
    console.log('Has Hash:', !!user?.passwordHash);
    console.log('------------------');
}

main().finally(() => prisma.$disconnect());
