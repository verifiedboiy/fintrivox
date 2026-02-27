// @ts-nocheck
import { Router, Response } from 'express';
import prisma from '../config/db.js';
import { requireAuth, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { createAuditLog } from '../utils/audit.js';
import { createNotification, createBroadcastNotification } from '../services/notification.service.js';
import { sendKYCStatusEmail } from '../services/email.service.js';

const router = Router();

// Helper to safely get a query param as string
const qs = (val: unknown): string | undefined =>
    typeof val === 'string' ? val : Array.isArray(val) ? val[0] : undefined;

// All admin routes require auth + admin role
router.use(requireAuth as any);
router.use(requireAdmin as any);

// Simple in-memory cache for stats
let statsCache: { data: any, timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 60 seconds

router.get('/stats', async (_req: AuthRequest, res: Response) => {
    try {
        // Check cache
        if (statsCache && (Date.now() - statsCache.timestamp < CACHE_TTL)) {
            return res.json({ stats: statsCache.data, fromCache: true });
        }

        const [
            totalUsers, activeUsers, newUsersToday,
            totalDeposits, pendingDeposits,
            totalWithdrawals, pendingWithdrawals,
            activeInvestments, totalInvestments,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { status: 'ACTIVE' } }),
            prisma.user.count({
                where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
            }),
            prisma.transaction.aggregate({ where: { type: 'DEPOSIT', status: 'COMPLETED' }, _sum: { amount: true } }),
            prisma.transaction.count({ where: { type: 'DEPOSIT', status: 'PENDING' } }),
            prisma.transaction.aggregate({ where: { type: 'WITHDRAWAL', status: 'COMPLETED' }, _sum: { amount: true } }),
            prisma.transaction.count({ where: { type: 'WITHDRAWAL', status: 'PENDING' } }),
            prisma.investment.count({ where: { status: 'ACTIVE' } }),
            prisma.investment.aggregate({ _sum: { amount: true } }),
        ]);

        const stats = {
            totalUsers,
            activeUsers,
            newUsersToday,
            totalDeposits: totalDeposits._sum.amount || 0,
            pendingDeposits,
            totalWithdrawals: totalWithdrawals._sum.amount || 0,
            pendingWithdrawals,
            activeInvestments,
            totalInvestments: totalInvestments._sum.amount || 0,
        };

        // Update cache
        statsCache = { data: stats, timestamp: Date.now() };

        res.json({ stats });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ============================================================
// USER MANAGEMENT
// ============================================================

// GET /api/admin/users — list all users
router.get('/users', async (req: AuthRequest, res: Response) => {
    try {
        const search = qs(req.query.search);
        const status = qs(req.query.status);
        const kycStatus = qs(req.query.kycStatus);
        const page = qs(req.query.page) || '1';
        const limit = qs(req.query.limit) || '20';
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where: any = {};
        if (status) where.status = status.toUpperCase();
        if (kycStatus) where.kycStatus = kycStatus.toUpperCase();
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true, email: true, firstName: true, lastName: true,
                    phone: true, country: true, balance: true, availableBalance: true,
                    investedAmount: true, totalProfit: true, totalWithdrawn: true, totalDeposited: true,
                    role: true, status: true, kycStatus: true, emailVerified: true,
                    twoFactorEnabled: true, createdAt: true, lastLogin: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET /api/admin/users/:id — single user details
router.get('/users/:id', async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true, email: true, firstName: true, lastName: true,
                phone: true, country: true, address: true, city: true, postalCode: true,
                dateOfBirth: true, balance: true, availableBalance: true,
                investedAmount: true, totalProfit: true, totalWithdrawn: true, totalDeposited: true,
                role: true, status: true, kycStatus: true, kycSubmittedAt: true,
                emailVerified: true, twoFactorEnabled: true, referralCode: true, referredBy: true,
                withdrawalKey: true, createdAt: true, lastLogin: true,
                transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
                investments: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
                kycDocuments: true,
            },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// PATCH /api/admin/users/:id — update user (status, balance, KYC, etc.)
router.patch('/users/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { status, kycStatus, balance, availableBalance, role, suspensionReason } = req.body;
        const userId = req.params.id;
        const adminId = req.user!.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const updateData: any = {};
        const auditDetails: string[] = [];

        if (status && status !== user.status) {
            updateData.status = status.toUpperCase();
            auditDetails.push(`Status: ${user.status} → ${status.toUpperCase()}`);
        }

        if (suspensionReason !== undefined && suspensionReason !== user.suspensionReason) {
            updateData.suspensionReason = suspensionReason;
            auditDetails.push(`Suspension Reason: ${user.suspensionReason || 'None'} → ${suspensionReason || 'None'}`);
        }

        if (kycStatus && kycStatus !== user.kycStatus) {
            updateData.kycStatus = kycStatus.toUpperCase();
            auditDetails.push(`KYC: ${user.kycStatus} → ${kycStatus.toUpperCase()}`);
        }

        if (balance !== undefined && balance !== user.balance) {
            const diff = balance - user.balance;
            updateData.balance = balance;
            updateData.availableBalance = user.availableBalance + diff;
            auditDetails.push(`Balance: $${user.balance} → $${balance}`);

            // Create DEPOSIT or WITHDRAWAL transaction
            if (diff > 0) {
                // Adding funds -> show as Deposit
                updateData.totalDeposited = user.totalDeposited + diff;
                await prisma.transaction.create({
                    data: {
                        userId,
                        type: 'DEPOSIT',
                        amount: Math.abs(diff),
                        status: 'COMPLETED',
                        description: 'Deposit successful',
                        reference: `DEP-${Date.now()}`,
                        method: 'System',
                        processedBy: adminId,
                        processedAt: new Date(),
                    },
                });

                await createNotification({
                    userId,
                    title: 'Deposit Received',
                    message: `Your deposit of $${Math.abs(diff).toLocaleString()} has been received and credited to your account.`,
                    type: 'SUCCESS',
                    link: '/dashboard/transactions',
                });
            } else {
                // Deducting funds -> show as Withdrawal
                updateData.totalWithdrawn = user.totalWithdrawn + Math.abs(diff);
                await prisma.transaction.create({
                    data: {
                        userId,
                        type: 'WITHDRAWAL',
                        amount: Math.abs(diff),
                        status: 'COMPLETED',
                        description: 'Withdrawal successful',
                        reference: `WTH-${Date.now()}`,
                        method: 'System',
                        processedBy: adminId,
                        processedAt: new Date(),
                    },
                });

                await createNotification({
                    userId,
                    title: 'Withdrawal Processed',
                    message: `Your withdrawal of $${Math.abs(diff).toLocaleString()} has been processed.`,
                    type: 'SUCCESS',
                    link: '/dashboard/transactions',
                });
            }
        }

        if (role && role !== user.role) {
            updateData.role = role.toUpperCase();
            auditDetails.push(`Role: ${user.role} → ${role.toUpperCase()}`);
        }

        // Handle totalProfit adjustment
        const { totalProfit: newTotalProfit } = req.body;
        if (newTotalProfit !== undefined && newTotalProfit !== user.totalProfit) {
            const profitDiff = newTotalProfit - user.totalProfit;
            updateData.totalProfit = newTotalProfit;
            // Also add the profit difference to balance and availableBalance
            updateData.balance = (updateData.balance !== undefined ? updateData.balance : user.balance) + profitDiff;
            updateData.availableBalance = (updateData.availableBalance !== undefined ? updateData.availableBalance : user.availableBalance) + profitDiff;
            auditDetails.push(`Profit: $${user.totalProfit} → $${newTotalProfit}`);

            // Create PROFIT transaction
            if (profitDiff > 0) {
                await prisma.transaction.create({
                    data: {
                        userId,
                        type: 'PROFIT',
                        amount: Math.abs(profitDiff),
                        status: 'COMPLETED',
                        description: 'Profit earned from investment',
                        reference: `PRF-${Date.now()}`,
                        method: 'System',
                        processedBy: adminId,
                        processedAt: new Date(),
                    },
                });
            }

            await createNotification({
                userId,
                title: 'Profit Updated',
                message: `Your profit has been ${profitDiff > 0 ? 'increased' : 'decreased'} by $${Math.abs(profitDiff).toLocaleString()}.`,
                type: profitDiff > 0 ? 'SUCCESS' : 'INFO',
                link: '/dashboard',
            });
        }

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ error: 'No changes provided' });
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        // Audit log
        await createAuditLog({
            adminId,
            action: 'UPDATE_USER',
            targetUserId: userId,
            targetType: 'user',
            details: auditDetails.join('; '),
            ipAddress: req.ip,
        });

        // Notify user of changes
        if (status) {
            await createNotification({
                userId,
                title: status === 'SUSPENDED' ? 'Account Suspended' : 'Account Updated',
                message: status === 'SUSPENDED'
                    ? (suspensionReason || user.suspensionReason || 'Your account has been suspended. Contact support for more info.')
                    : `Your account status has been updated to ${status}.`,
                type: status === 'SUSPENDED' ? 'ERROR' : 'INFO',
            });
        }

        if (kycStatus) {
            await createNotification({
                userId,
                title: `KYC ${kycStatus === 'VERIFIED' ? 'Approved' : kycStatus === 'REJECTED' ? 'Rejected' : 'Updated'}`,
                message: kycStatus === 'VERIFIED'
                    ? 'Your KYC verification has been approved! You can now make withdrawals.'
                    : kycStatus === 'REJECTED'
                        ? 'Your KYC verification was rejected. Please resubmit your documents.'
                        : `Your KYC status has been updated to ${kycStatus}.`,
                type: kycStatus === 'VERIFIED' ? 'SUCCESS' : kycStatus === 'REJECTED' ? 'ERROR' : 'INFO',
                link: '/dashboard/kyc',
            });
            sendKYCStatusEmail(updatedUser.email, kycStatus.toUpperCase(), updatedUser.firstName).catch(console.error);
        }

        res.json({ user: updatedUser });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE /api/admin/users/:id — delete user account completely
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.params.id;
        const adminId = req.user!.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (user.role === 'ADMIN') {
            res.status(403).json({ error: 'Cannot delete an admin account' });
            return;
        }

        // Log BEFORE delete to ensure targetUserId still exists for the relation
        await createAuditLog({
            adminId,
            action: 'DELETE_USER',
            targetUserId: userId,
            targetType: 'user',
            details: `Deleted user account: ${user.email} (${user.firstName} ${user.lastName})`,
            ipAddress: req.ip,
        });

        await prisma.user.delete({ where: { id: userId } });

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ============================================================
// TRANSACTION MANAGEMENT (approve/deny deposits & withdrawals)
// ============================================================

// GET /api/admin/transactions — all transactions
router.get('/transactions', async (req: AuthRequest, res: Response) => {
    try {
        const type = qs(req.query.type);
        const status = qs(req.query.status);
        const page = qs(req.query.page) || '1';
        const limit = qs(req.query.limit) || '20';
        const where: any = {};
        if (type) where.type = type.toUpperCase();
        if (status) where.status = status.toUpperCase();

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: {
                    user: { select: { id: true, email: true, firstName: true, lastName: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            }),
            prisma.transaction.count({ where }),
        ]);

        res.json({ transactions, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// POST /api/admin/transactions/:id/approve — approve a pending transaction
router.post('/transactions/:id/approve', async (req: AuthRequest, res: Response) => {
    try {
        const txId = req.params.id;
        const adminId = req.user!.id;

        const transaction = await prisma.transaction.findUnique({ where: { id: txId } });
        if (!transaction) {
            res.status(404).json({ error: 'Transaction not found' });
            return;
        }
        if (transaction.status !== 'PENDING') {
            res.status(400).json({ error: 'Transaction is not pending' });
            return;
        }

        // Update transaction status
        await prisma.transaction.update({
            where: { id: txId },
            data: {
                status: 'COMPLETED',
                processedBy: adminId,
                processedAt: new Date(),
            },
        });

        // Update user balance based on transaction type
        if (transaction.type === 'DEPOSIT') {
            const netAmount = transaction.netAmount || transaction.amount;
            await prisma.user.update({
                where: { id: transaction.userId },
                data: {
                    balance: { increment: netAmount },
                    availableBalance: { increment: netAmount },
                    totalDeposited: { increment: netAmount },
                },
            });

            await createNotification({
                userId: transaction.userId,
                title: 'Deposit Confirmed',
                message: `Your deposit of $${transaction.amount.toLocaleString()} has been confirmed and added to your balance.`,
                type: 'SUCCESS',
                link: '/dashboard',
            });
        } else if (transaction.type === 'WITHDRAWAL') {
            // Balance was already frozen on creation, now deduct from total
            await prisma.user.update({
                where: { id: transaction.userId },
                data: {
                    balance: { decrement: transaction.amount },
                    totalWithdrawn: { increment: transaction.amount },
                },
            });

            await createNotification({
                userId: transaction.userId,
                title: 'Withdrawal Approved',
                message: `Your withdrawal of $${transaction.amount.toLocaleString()} has been approved and processed.`,
                type: 'SUCCESS',
                link: '/dashboard/transactions',
            });
        }

        // Audit
        await createAuditLog({
            adminId,
            action: `APPROVE_${transaction.type}`,
            targetUserId: transaction.userId,
            targetType: 'transaction',
            details: `Approved ${transaction.type.toLowerCase()} of $${transaction.amount}`,
            amount: transaction.amount,
            ipAddress: req.ip,
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Approve transaction error:', error);
        res.status(500).json({ error: 'Failed to approve transaction' });
    }
});

// POST /api/admin/transactions/:id/deny — deny a pending transaction
router.post('/transactions/:id/deny', async (req: AuthRequest, res: Response) => {
    try {
        const txId = req.params.id;
        const adminId = req.user!.id;
        const { reason } = req.body;

        const transaction = await prisma.transaction.findUnique({ where: { id: txId } });
        if (!transaction || transaction.status !== 'PENDING') {
            res.status(400).json({ error: 'Transaction not found or not pending' });
            return;
        }

        await prisma.transaction.update({
            where: { id: txId },
            data: {
                status: 'CANCELLED',
                processedBy: adminId,
                processedAt: new Date(),
            },
        });

        // If withdrawal, refund frozen balance
        if (transaction.type === 'WITHDRAWAL') {
            await prisma.user.update({
                where: { id: transaction.userId },
                data: {
                    availableBalance: { increment: transaction.amount },
                },
            });
        }

        await createNotification({
            userId: transaction.userId,
            title: `${transaction.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'} Denied`,
            message: `Your ${transaction.type.toLowerCase()} of $${transaction.amount.toLocaleString()} was denied.${reason ? ` Reason: ${reason}` : ''}`,
            type: 'ERROR',
            link: '/dashboard/transactions',
        });

        await createAuditLog({
            adminId,
            action: `DENY_${transaction.type}`,
            targetUserId: transaction.userId,
            targetType: 'transaction',
            details: `Denied ${transaction.type.toLowerCase()} of $${transaction.amount}${reason ? `. Reason: ${reason}` : ''}`,
            amount: transaction.amount,
            ipAddress: req.ip,
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to deny transaction' });
    }
});

// ============================================================
// AUDIT LOGS
// ============================================================

router.get('/audit-logs', async (req: AuthRequest, res: Response) => {
    try {
        const page = qs(req.query.page) || '1';
        const limit = qs(req.query.limit) || '50';
        const logs = await prisma.auditLog.findMany({
            include: {
                admin: { select: { id: true, firstName: true, lastName: true, email: true } },
                targetUser: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
        });
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// ============================================================
// INVESTMENT PLAN MANAGEMENT
// ============================================================

router.get('/plans', async (_req: AuthRequest, res: Response) => {
    try {
        const plans = await prisma.investmentPlan.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json({ plans });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});

router.post('/plans', async (req: AuthRequest, res: Response) => {
    try {
        const { dailyProfitRate, name, minAmount, duration, category, ...rest } = req.body;

        if (!name || dailyProfitRate === undefined || minAmount === undefined || duration === undefined) {
            return res.status(400).json({ error: 'Missing required fields: name, dailyProfitRate, minAmount, or duration' });
        }

        // Map dailyProfitRate from frontend to dailyProfit in DB
        const dailyProfit = parseFloat(dailyProfitRate);
        const monthlyProfit = dailyProfit * 30;
        const yearlyProfit = dailyProfit * 365;

        const planData = {
            ...rest,
            name,
            minAmount: parseFloat(minAmount),
            duration: parseInt(duration),
            dailyProfit,
            monthlyProfit,
            yearlyProfit,
            category: category || 'mixed',
            status: req.body.status || 'active'
        };

        const plan = await prisma.investmentPlan.create({ data: planData });

        await createAuditLog({
            adminId: req.user!.id,
            action: 'CREATE_PLAN',
            targetType: 'plan',
            details: `Created investment plan: ${plan.name}`,
            ipAddress: req.ip,
        });

        // Broadcast notification to all users
        try {
            await createBroadcastNotification({
                title: '🎁 New Investment Plan Available!',
                message: `The "${plan.name}" plan has been launched with ${plan.dailyProfit}% daily profit. Invest now!`,
                type: 'SUCCESS',
                link: '/dashboard/invest'
            });
        } catch (notifError) {
            console.error('Failed to send broadcast notification:', notifError);
            // Don't fail the whole request if notification fails
        }

        res.status(201).json({ plan });
    } catch (error: any) {
        console.error('Create plan error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'A plan with this name already exists.' });
        }
        res.status(500).json({ error: 'Failed to create plan. Please check all fields.' });
    }
});

router.post('/plans/restore-defaults', async (req: AuthRequest, res: Response) => {
    try {
        const defaultPlans = [
            {
                name: 'Starter',
                description: 'Perfect for beginners starting their investment journey.',
                minAmount: 100,
                maxAmount: 999,
                dailyProfit: 0.5,
                monthlyProfit: 15,
                yearlyProfit: 180,
                duration: 28,
                riskLevel: 'low',
                category: 'mixed',
                status: 'active',
                color: '#10B981',
                features: ['Daily Profit', 'Capital Protection', 'Instant Withdrawal']
            },
            {
                name: 'Growth',
                description: 'Accelerate your wealth with higher returns and portfolio management.',
                minAmount: 1000,
                maxAmount: 9999,
                dailyProfit: 0.8,
                monthlyProfit: 24,
                yearlyProfit: 292,
                duration: 28,
                riskLevel: 'medium',
                category: 'mixed',
                status: 'active',
                color: '#3B82F6',
                popular: true,
                features: ['Higher Returns', 'Portfolio Management', 'Priority Support']
            },
            {
                name: 'Elite',
                description: 'Maximum returns for high-net-worth investors with dedicated management.',
                minAmount: 10000,
                maxAmount: 1000000,
                dailyProfit: 1.5,
                monthlyProfit: 45,
                yearlyProfit: 547.5,
                duration: 28,
                riskLevel: 'high',
                category: 'mixed',
                status: 'active',
                color: '#F59E0B',
                features: ['Maximum Returns', 'Dedicated Manager', 'VIP Events']
            }
        ];

        for (const plan of defaultPlans) {
            await prisma.investmentPlan.upsert({
                where: { name: plan.name },
                update: plan,
                create: plan
            });
        }

        await createAuditLog({
            adminId: req.user!.id,
            action: 'RESTORE_DEFAULT_PLANS',
            targetType: 'plan',
            details: 'Restored system default investment plans',
            ipAddress: req.ip,
        });

        res.json({ success: true, message: 'Default plans restored successfully' });
    } catch (error) {
        console.error('Restore default plans error:', error);
        res.status(500).json({ error: 'Failed to restore default plans' });
    }
});

router.patch('/plans/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { dailyProfitRate, ...rest } = req.body;
        const updateData = { ...rest };

        if (dailyProfitRate !== undefined) {
            const dailyProfit = parseFloat(dailyProfitRate);
            updateData.dailyProfit = dailyProfit;
            updateData.monthlyProfit = dailyProfit * 30;
            updateData.yearlyProfit = dailyProfit * 365;
        }

        const plan = await prisma.investmentPlan.update({
            where: { id: req.params.id },
            data: updateData,
        });

        await createAuditLog({
            adminId: req.user!.id,
            action: 'UPDATE_PLAN',
            targetType: 'plan',
            details: `Updated investment plan: ${plan.name}`,
            ipAddress: req.ip,
        });

        res.json({ plan });
    } catch (error) {
        console.error('Update plan error:', error);
        res.status(500).json({ error: 'Failed to update plan' });
    }
});

router.delete('/plans/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Check if there are active investments for this plan
        const activeInvestmentsCount = await prisma.investment.count({
            where: { planId: id, status: 'ACTIVE' }
        });

        if (activeInvestmentsCount > 0) {
            return res.status(400).json({ error: 'Cannot delete plan with active investments' });
        }

        const plan = await prisma.investmentPlan.delete({
            where: { id }
        });

        await createAuditLog({
            adminId: req.user!.id,
            action: 'DELETE_PLAN',
            targetType: 'plan',
            details: `Deleted investment plan: ${plan.name}`,
            ipAddress: req.ip,
        });

        res.json({ success: true, message: 'Plan deleted successfully' });
    } catch (error) {
        console.error('Delete plan error:', error);
        res.status(500).json({ error: 'Failed to delete plan' });
    }
});

// ============================================================
// PAYMENT METHODS
// ============================================================

router.get('/payment-methods', async (_req: AuthRequest, res: Response) => {
    try {
        const methods = await prisma.paymentMethod.findMany();
        res.json({ methods });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payment methods' });
    }
});

// ============================================================
// SUPPORT TICKET MANAGEMENT
// ============================================================

router.get('/support-tickets', async (req: AuthRequest, res: Response) => {
    try {
        const status = qs(req.query.status);
        const page = qs(req.query.page) || '1';
        const limit = qs(req.query.limit) || '20';
        const where: any = {};
        if (status) where.status = status.toUpperCase();

        const [tickets, total] = await Promise.all([
            prisma.supportTicket.findMany({
                where,
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true } },
                    replies: {
                        include: { user: { select: { firstName: true, lastName: true, role: true } } },
                        orderBy: { createdAt: 'asc' },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            }),
            prisma.supportTicket.count({ where }),
        ]);

        res.json({ tickets, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch support tickets' });
    }
});

router.post('/support-tickets/:id/reply', async (req: AuthRequest, res: Response) => {
    try {
        const reply = await prisma.ticketReply.create({
            data: {
                ticketId: req.params.id,
                userId: req.user!.id,
                isAdmin: true,
                message: req.body.message,
            },
        });

        // Update ticket status
        await prisma.supportTicket.update({
            where: { id: req.params.id },
            data: { status: 'IN_PROGRESS' },
        });

        // Get ticket to notify user
        const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
        if (ticket) {
            await createNotification({
                userId: ticket.userId,
                title: 'Support Reply',
                message: `Admin replied to your ticket: "${ticket.subject}"`,
                type: 'INFO',
            });
        }

        await createAuditLog({
            adminId: req.user!.id,
            action: 'REPLY_SUPPORT_TICKET',
            targetType: 'support_ticket',
            details: `Replied to support ticket ${req.params.id}`,
            ipAddress: req.ip,
        });

        res.status(201).json({ reply });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reply to ticket' });
    }
});

router.patch('/support-tickets/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        const ticket = await prisma.supportTicket.update({
            where: { id: req.params.id },
            data: { status: status.toUpperCase() },
        });
        res.json({ ticket });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});

// ============================================================
// KYC MANAGEMENT
// ============================================================

router.get('/kyc', async (req: AuthRequest, res: Response) => {
    try {
        const status = qs(req.query.status);
        const page = qs(req.query.page) || '1';
        const limit = qs(req.query.limit) || '50';

        // If a specific status filter is given, use it; otherwise show ALL users (admins need to see everyone)
        const where: any = status ? { kycStatus: status.toUpperCase() } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true, firstName: true, lastName: true, email: true,
                    kycStatus: true, kycSubmittedAt: true, createdAt: true,
                    kycDocuments: true,
                },
                orderBy: [
                    { kycSubmittedAt: 'desc' },
                    { createdAt: 'desc' },
                ],
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            }),
            prisma.user.count({ where }),
        ]);

        res.json({ users, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch KYC data' });
    }
});

router.post('/kyc/:userId/approve', async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const updatedUser = await prisma.user.update({ where: { id: userId }, data: { kycStatus: 'VERIFIED' } });
        await prisma.kycDocument.updateMany({ where: { userId }, data: { status: 'approved' } });

        sendKYCStatusEmail(updatedUser.email, 'VERIFIED', updatedUser.firstName).catch(console.error);

        await createNotification({
            userId,
            title: 'KYC Approved',
            message: 'Your KYC verification has been approved! You can now make withdrawals.',
            type: 'SUCCESS',
            link: '/dashboard/kyc',
        });

        await createAuditLog({
            adminId: req.user!.id,
            action: 'APPROVE_KYC',
            targetUserId: userId,
            targetType: 'kyc',
            details: 'Approved KYC verification',
            ipAddress: req.ip,
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve KYC' });
    }
});

router.post('/kyc/:userId/reject', async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const updatedUser = await prisma.user.update({ where: { id: userId }, data: { kycStatus: 'REJECTED' } });
        await prisma.kycDocument.updateMany({ where: { userId }, data: { status: 'rejected', rejectionReason: reason || 'Documents not acceptable' } });

        sendKYCStatusEmail(updatedUser.email, 'REJECTED', updatedUser.firstName).catch(console.error);

        await createNotification({
            userId,
            title: 'KYC Rejected',
            message: `Your KYC verification was rejected. Reason: ${reason || 'Documents not acceptable'}. Please resubmit.`,
            type: 'ERROR',
            link: '/dashboard/kyc',
        });

        await createAuditLog({
            adminId: req.user!.id,
            action: 'REJECT_KYC',
            targetUserId: userId,
            targetType: 'kyc',
            details: `Rejected KYC verification. Reason: ${reason || 'N/A'}`,
            ipAddress: req.ip,
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject KYC' });
    }
});

// DELETE /api/admin/kyc/:userId/documents/:field — delete a specific KYC document field
router.delete('/kyc/:userId/documents/:field', async (req: AuthRequest, res: Response) => {
    try {
        const { userId, field } = req.params;
        const validFields = ['frontImage', 'backImage', 'selfieImage', 'selfieVideo'];

        if (!validFields.includes(field)) {
            res.status(400).json({ error: 'Invalid document field' });
            return;
        }

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Update the document field to null
        await prisma.kycDocument.updateMany({
            where: { userId },
            data: { [field]: null }
        });

        await createAuditLog({
            adminId: req.user!.id,
            action: 'DELETE_KYC_DOC',
            targetUserId: userId,
            targetType: 'kyc',
            details: `Deleted KYC document field: ${field}`,
            ipAddress: req.ip,
        });

        res.json({ success: true, message: `Field ${field} deleted successfully` });
    } catch (error) {
        console.error('Delete KYC doc error:', error);
        res.status(500).json({ error: 'Failed to delete KYC document' });
    }
});

// DELETE /api/admin/kyc/:userId/documents — wipe ALL documents for a user
router.delete('/kyc/:userId/documents', async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;

        const doc = await prisma.kycDocument.findFirst({ where: { userId } });
        if (!doc) {
            res.status(404).json({ error: 'No KYC documents found for this user' });
            return;
        }

        await prisma.kycDocument.update({
            where: { id: doc.id },
            data: {
                frontImage: null,
                backImage: null,
                selfieImage: null,
                selfieVideo: null,
            }
        });

        await createAuditLog({
            adminId: req.user!.id,
            action: 'WIPE_KYC_DOCS',
            targetUserId: userId,
            targetType: 'kyc',
            details: `Wiped all KYC documents to save space`,
            ipAddress: req.ip,
        });

        res.json({ success: true, message: 'All documents wiped successfully' });
    } catch (error) {
        console.error('Wipe KYC docs error:', error);
        res.status(500).json({ error: 'Failed to wipe documents' });
    }
});

// ============================================================
// EXTENDED STATS (pending KYC count, open tickets)
// ============================================================

router.get('/alerts', async (_req: AuthRequest, res: Response) => {
    try {
        const [pendingKyc, openTickets, pendingDeposits, pendingWithdrawals] = await Promise.all([
            prisma.user.count({ where: { kycStatus: 'PENDING' } }),
            prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
            prisma.transaction.count({ where: { type: 'DEPOSIT', status: 'PENDING' } }),
            prisma.transaction.count({ where: { type: 'WITHDRAWAL', status: 'PENDING' } }),
        ]);
        res.json({ pendingKyc, openTickets, pendingDeposits, pendingWithdrawals });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

export default router;

