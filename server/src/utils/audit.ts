import prisma from '../config/db.js';

export async function createAuditLog(params: {
    adminId: string;
    action: string;
    targetUserId?: string;
    targetType?: string;
    details: string;
    amount?: number;
    oldValue?: string;
    newValue?: string;
    ipAddress?: string;
}) {
    return prisma.auditLog.create({
        data: params,
    });
}
