import prisma from '../src/config/db.js';
import { createBroadcastNotification, createTargetedNotifications } from '../src/services/notification.service.js';

async function main() {
    console.log('--- Testing Broadcast Notifications ---');
    try {
        const users = await prisma.user.findMany({
            where: { status: 'ACTIVE' },
            take: 2
        });

        if (users.length === 0) {
            console.log('No active users found to test with.');
            return;
        }

        console.log(`Found ${users.length} active users.`);

        // Test Broadcast All
        console.log('Testing Broadcast All...');
        const broadcastResult = await createBroadcastNotification({
            title: 'Test Global Broadcast',
            message: 'This is a test broadcast to all users.',
            type: 'INFO'
        });
        console.log('Broadcast All Success:', broadcastResult.count);

        // Test Targeted
        console.log('Testing Targeted Broadcast...');
        const userIds = users.map(u => u.id);
        const targetedResult = await createTargetedNotifications({
            userIds,
            title: 'Test Targeted Broadcast',
            message: 'This is a test broadcast to selected users.',
            type: 'SUCCESS'
        });
        console.log('Targeted Broadcast Success:', targetedResult.count);

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
