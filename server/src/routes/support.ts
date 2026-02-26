// @ts-nocheck
import { Router, Response } from 'express';
import prisma from '../config/db.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { createNotification } from '../services/notification.service.js';

const router = Router();
router.use(requireAuth as any);

// POST /api/support — create support ticket
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const { subject, message, category, priority } = req.body;
        const ticket = await prisma.supportTicket.create({
            data: {
                userId: req.user!.id,
                subject,
                message,
                category: category || 'general',
                priority: priority || 'MEDIUM',
            },
        });

        // Notify all admins
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
            await createNotification({
                userId: admin.id,
                title: 'New Support Ticket',
                message: `New ticket: "${subject}" from ${req.user!.email}`,
                type: 'INFO',
                link: '/admin/support',
            });
        }

        res.status(201).json({ ticket });
    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

// GET /api/support — list user's tickets
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            where: { userId: req.user!.id },
            include: { replies: { include: { user: { select: { firstName: true, lastName: true, role: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ tickets });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

// POST /api/support/:id/reply — reply to a ticket
router.post('/:id/reply', async (req: AuthRequest, res: Response) => {
    try {
        const ticket = await prisma.supportTicket.findFirst({
            where: { id: req.params.id, userId: req.user!.id },
        });
        if (!ticket) {
            res.status(404).json({ error: 'Ticket not found' });
            return;
        }

        const reply = await prisma.ticketReply.create({
            data: {
                ticketId: req.params.id,
                userId: req.user!.id,
                isAdmin: req.user!.role === 'ADMIN',
                message: req.body.message,
            },
            include: { user: { select: { firstName: true, lastName: true, role: true } } },
        });

        res.status(201).json({ reply });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add reply' });
    }
});

export default router;
