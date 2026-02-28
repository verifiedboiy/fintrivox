import prisma from '../config/db.js';

export async function createNotification(params: {
    userId: string;
    title: string;
    message: string;
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    link?: string;
}) {
    return prisma.notification.create({
        data: {
            userId: params.userId,
            title: params.title,
            message: params.message,
            type: params.type || 'INFO',
            link: params.link,
        },
    });
}

export async function createBroadcastNotification(params: {
    title: string;
    message: string;
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    link?: string;
}) {
    const users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true }
    });

    const notifications = users.map(user => ({
        userId: user.id,
        title: params.title,
        message: params.message,
        type: params.type || 'INFO',
        link: params.link,
    }));

    return prisma.notification.createMany({
        data: notifications
    });
}

export async function createTargetedNotifications(params: {
    userIds: string[];
    title: string;
    message: string;
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    link?: string;
}) {
    const notifications = params.userIds.map(userId => ({
        userId,
        title: params.title,
        message: params.message,
        type: params.type || 'INFO',
        link: params.link,
    }));

    return prisma.notification.createMany({
        data: notifications
    });
}
