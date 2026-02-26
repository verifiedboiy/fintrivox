// @ts-nocheck
import { Router, Response } from 'express';
import prisma from '../config/db.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth as any);

// ---------- GET /api/notifications ----------
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.json({ notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// ---------- GET /api/notifications/unread-count ----------
router.get('/unread-count', async (req: AuthRequest, res: Response) => {
    try {
        const count = await prisma.notification.count({
            where: { userId: req.user!.id, read: false },
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// ---------- PATCH /api/notifications/:id/read ----------
router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
    try {
        await prisma.notification.updateMany({
            where: { id: req.params.id, userId: req.user!.id },
            data: { read: true },
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

// ---------- PATCH /api/notifications/read-all ----------
router.patch('/read-all', async (req: AuthRequest, res: Response) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user!.id, read: false },
            data: { read: true },
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

export default router;
