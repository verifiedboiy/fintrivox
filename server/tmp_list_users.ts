import prisma from './src/config/db.js';
async function main() {
    const users = await prisma.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true, kycStatus: true } });
    console.log('Users:', JSON.stringify(users, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
