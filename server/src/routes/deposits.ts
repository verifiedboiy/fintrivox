// @ts-nocheck
import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createNotification } from '../services/notification.service.js';
import { sendAdminNotificationEmail } from '../services/email.service.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const router = Router();
router.use(requireAuth as any);

const depositSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    method: z.string().min(1, 'Payment method is required'),
    txHash: z.string().optional(),
    stripePaymentIntentId: z.string().optional(),
});

const paymentIntentSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
});

// ---------- POST /api/deposits — create deposit request ----------
router.post('/', validate(depositSchema), async (req: AuthRequest, res: Response) => {
    try {
        const { amount, method, txHash } = req.body;
        const userId = req.user!.id;

        // Get payment method to calculate fee
        const paymentMethod = await prisma.paymentMethod.findFirst({
            where: { name: method, status: 'active' },
        });

        let fee = 0;
        if (paymentMethod) {
            fee = paymentMethod.feeType === 'percentage'
                ? amount * (paymentMethod.fee / 100)
                : paymentMethod.fee;

            if (amount < paymentMethod.minAmount || amount > paymentMethod.maxAmount) {
                res.status(400).json({
                    error: `Amount must be between $${paymentMethod.minAmount} and $${paymentMethod.maxAmount}`,
                });
                return;
            }
        }

        const netAmount = amount - fee;
        const reference = `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Create transaction record (pending — wait for admin approval)
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                type: 'DEPOSIT',
                amount,
                currency: 'USD',
                status: 'PENDING',
                description: `Deposit via ${method}`,
                reference,
                method,
                fee,
                netAmount,
                txHash,
            },
        });

        // Notify user
        await createNotification({
            userId,
            title: 'Deposit Submitted',
            message: `Your deposit of $${amount.toLocaleString()} via ${method} is pending confirmation.`,
            type: 'INFO',
            link: '/dashboard/transactions',
        });

        // Notify admin
        const user = await prisma.user.findUnique({ where: { id: userId } });
        await sendAdminNotificationEmail(
            `New Deposit Request: $${amount}`,
            `<p><strong>User:</strong> ${user?.firstName} ${user?.lastName} (${user?.email})</p>
             <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
             <p><strong>Method:</strong> ${method}</p>
             <p><strong>Tx Hash:</strong> ${txHash || 'N/A'}</p>
             <p><strong>Reference:</strong> ${reference}</p>`
        );

        res.status(201).json({ transaction });
    } catch (error) {
        console.error('Create deposit error:', error);
        res.status(500).json({ error: 'Failed to create deposit' });
    }
});

// ---------- POST /api/deposits/payment-intent — create Stripe payment intent ----------
router.post('/payment-intent', validate(paymentIntentSchema), async (req: AuthRequest, res: Response) => {
    try {
        const { amount } = req.body;

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: req.user!.id,
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error: any) {
        console.error('Stripe PaymentIntent error:', error);
        res.status(500).json({ error: error.message || 'Failed to create payment intent' });
    }
});

// ---------- GET /api/deposits — list user's deposits ----------
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const deposits = await prisma.transaction.findMany({
            where: { userId: req.user!.id, type: 'DEPOSIT' },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ deposits });
    } catch (error) {
        console.error('Get deposits error:', error);
        res.status(500).json({ error: 'Failed to fetch deposits' });
    }
});

export default router;
