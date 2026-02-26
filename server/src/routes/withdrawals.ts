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

const withdrawSchema = z.object({
    amount: z.number().positive('Amount must be positive').min(100, 'Minimum withdrawal is $100'),
    method: z.string().min(1, 'Withdrawal method is required'),
    withdrawalKey: z.string().min(1, 'Withdrawal key is required'),
    walletAddress: z.string().optional(),
});

// ---------- POST /api/withdrawals — create withdrawal request ----------
router.post('/', validate(withdrawSchema), async (req: AuthRequest, res: Response) => {
    try {
        const { amount, method, withdrawalKey, walletAddress } = req.body;
        const userId = req.user!.id;

        // Get user and verify balance
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Check KYC status
        if (user.kycStatus !== 'VERIFIED') {
            res.status(403).json({ error: 'KYC verification required before withdrawals' });
            return;
        }

        // Check that user can only withdraw from profit
        if (amount > user.totalProfit) {
            res.status(400).json({ error: 'You can only withdraw from your earned profit. Insufficient profit balance.' });
            return;
        }

        // Verify withdrawal key
        if (user.withdrawalKey && user.withdrawalKey !== withdrawalKey) {
            res.status(403).json({ error: 'Invalid withdrawal key' });
            return;
        }

        // Calculate fee
        const paymentMethod = await prisma.paymentMethod.findFirst({
            where: { name: method, status: 'active' },
        });

        let fee = 0;
        if (paymentMethod) {
            fee = paymentMethod.feeType === 'percentage'
                ? amount * (paymentMethod.fee / 100)
                : paymentMethod.fee;
        }

        const netAmount = amount - fee;
        const reference = `WDR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Create pending withdrawal transaction
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                type: 'WITHDRAWAL',
                amount,
                currency: 'USD',
                status: 'PENDING',
                description: `Withdrawal via ${method}${walletAddress ? ` to ${walletAddress}` : ''}`,
                reference,
                method,
                fee,
                netAmount,
                withdrawalKey,
            },
        });

        // Reduce available balance (freeze the amount)
        await prisma.user.update({
            where: { id: userId },
            data: {
                availableBalance: { decrement: amount },
            },
        });

        // Notify user
        await createNotification({
            userId,
            title: 'Withdrawal Request Submitted',
            message: `Your withdrawal of $${amount.toLocaleString()} via ${method} is pending admin approval.`,
            type: 'INFO',
            link: '/dashboard/transactions',
        });

        // Notify admin
        await sendAdminNotificationEmail(
            `New Withdrawal Request: $${amount}`,
            `<p><strong>User:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
             <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
             <p><strong>Method:</strong> ${method}</p>
             <p><strong>Wallet/Details:</strong> ${walletAddress || 'N/A'}</p>
             <p><strong>Reference:</strong> ${reference}</p>`
        );

        res.status(201).json({ transaction });
    } catch (error) {
        console.error('Create withdrawal error:', error);
        res.status(500).json({ error: 'Failed to create withdrawal' });
    }
});

// ---------- GET /api/withdrawals — list user's withdrawals ----------
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const withdrawals = await prisma.transaction.findMany({
            where: { userId: req.user!.id, type: 'WITHDRAWAL' },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ withdrawals });
    } catch (error) {
        console.error('Get withdrawals error:', error);
        res.status(500).json({ error: 'Failed to fetch withdrawals' });
    }
});

export default router;
