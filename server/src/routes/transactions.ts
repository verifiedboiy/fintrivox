// @ts-nocheck
import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createNotification } from '../services/notification.service.js';

const router = Router();

// All routes require authentication
router.use(requireAuth as any);

// ---------- GET /api/transactions — list user's transactions ----------
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { type, status, page = '1', limit = '20' } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const where: any = { userId: req.user!.id };
        if (type) where.type = (type as string).toUpperCase();
        if (status) where.status = (status as string).toUpperCase();

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit as string),
            }),
            prisma.transaction.count({ where }),
        ]);

        res.json({
            transactions,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                pages: Math.ceil(total / parseInt(limit as string)),
            },
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// ---------- GET /api/transactions/:id — single transaction ----------
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const transaction = await prisma.transaction.findFirst({
            where: { id: req.params.id, userId: req.user!.id },
        });

        if (!transaction) {
            res.status(404).json({ error: 'Transaction not found' });
            return;
        }

        res.json({ transaction });
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
});

export default router;
