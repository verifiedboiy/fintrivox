// @ts-nocheck
import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createNotification } from '../services/notification.service.js';
import { sendAdminNotificationEmail } from '../services/email.service.js';

const router = Router();
router.use(requireAuth as any);

// ---------- GET /api/investments/plans ----------
router.get('/plans', async (_req: AuthRequest, res: Response) => {
    try {
        const plans = await prisma.investmentPlan.findMany({
            where: { status: 'active' },
            orderBy: { minAmount: 'asc' },
        });
        res.json({ plans });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});

// ---------- POST /api/investments — create investment ----------
const investSchema = z.object({
    planId: z.string().min(1),
    amount: z.number().positive(),
});

router.post('/', validate(investSchema), async (req: AuthRequest, res: Response) => {
    try {
        const { planId, amount } = req.body;
        const userId = req.user!.id;

        // Get plan
        const plan = await prisma.investmentPlan.findUnique({ where: { id: planId } });
        if (!plan || plan.status !== 'active') {
            res.status(404).json({ error: 'Investment plan not found or inactive' });
            return;
        }

        // Validate amount
        if (amount < plan.minAmount || amount > plan.maxAmount) {
            res.status(400).json({
                error: `Amount must be between $${plan.minAmount} and $${plan.maxAmount}`,
            });
            return;
        }

        // Check user balance
        const userBefore = await prisma.user.findUnique({ where: { id: userId } });
        console.log(`[DEBUG] User balance before investment: balance=${userBefore?.balance}, available=${userBefore?.availableBalance}`);

        if (!userBefore || userBefore.availableBalance < amount) {
            console.log(`[DEBUG] Insufficient balance: required=${amount}, available=${userBefore?.availableBalance}`);
            res.status(400).json({ error: 'Insufficient available balance' });
            return;
        }

        const endDate = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
        const nextProfitDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Create investment
        const investment = await prisma.investment.create({
            data: {
                userId,
                planId,
                amount,
                dailyProfitRate: plan.dailyProfit,
                endDate,
                nextProfitDate,
            },
        });

        // Create the investment transaction
        await prisma.transaction.create({
            data: {
                userId,
                type: 'INVESTMENT',
                amount,
                status: 'COMPLETED',
                description: `Investment in ${plan.name}`,
                reference: `INV-${Date.now()}`,
                processedAt: new Date(),
            },
        });

        // Update user balances
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                balance: { decrement: amount },
                availableBalance: { decrement: amount },
                investedAmount: { increment: amount },
            },
        });
        console.log(`[DEBUG] User balance after investment: balance=${updatedUser.balance}, available=${updatedUser.availableBalance}, invested=${updatedUser.investedAmount}`);

        // Notify
        await createNotification({
            userId,
            title: 'Investment Created',
            message: `You invested $${amount.toLocaleString()} in ${plan.name}. Daily profit: ${plan.dailyProfit}%.`,
            type: 'SUCCESS',
            link: '/dashboard/portfolio',
        });

        // Notify admin
        await sendAdminNotificationEmail(
            `New Investment: $${amount} in ${plan.name}`,
            `<p><strong>User:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
             <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
             <p><strong>Plan:</strong> ${plan.name}</p>
             <p><strong>Daily Profit:</strong> ${plan.dailyProfit}%</p>
             <p><strong>Duration:</strong> ${plan.duration} days</p>`
        );

        res.status(201).json({ investment });
    } catch (error) {
        console.error('Create investment error:', error);
        res.status(500).json({ error: 'Failed to create investment' });
    }
});

export default router;
