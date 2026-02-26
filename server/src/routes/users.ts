// @ts-nocheck
import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth as any);

// ---------- GET /api/users/profile ----------
router.get('/profile', async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true, email: true, firstName: true, lastName: true,
                phone: true, country: true, address: true, city: true,
                postalCode: true, dateOfBirth: true, balance: true,
                availableBalance: true, investedAmount: true, totalProfit: true,
                totalWithdrawn: true, totalDeposited: true, role: true, status: true,
                emailVerified: true, twoFactorEnabled: true, kycStatus: true,
                referralCode: true, createdAt: true, lastLogin: true,
            },
        });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// ---------- PATCH /api/users/profile ----------
router.patch('/profile', async (req: AuthRequest, res: Response) => {
    try {
        const { firstName, lastName, phone, country, address, city, postalCode, dateOfBirth } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(phone && { phone }),
                ...(country && { country }),
                ...(address && { address }),
                ...(city && { city }),
                ...(postalCode && { postalCode }),
                ...(dateOfBirth && { dateOfBirth }),
            },
            select: {
                id: true, email: true, firstName: true, lastName: true,
                phone: true, country: true, address: true, city: true, postalCode: true,
                dateOfBirth: true, balance: true, availableBalance: true,
            },
        });

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// ---------- GET /api/users/dashboard-stats ----------
router.get('/dashboard-stats', async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const [activeInvestments, pendingTransactions] = await Promise.all([
            prisma.investment.count({ where: { userId: user.id, status: 'ACTIVE' } }),
            prisma.transaction.count({ where: { userId: user.id, status: 'PENDING' } }),
        ]);

        res.json({
            stats: {
                totalBalance: user.balance,
                availableBalance: user.availableBalance,
                investedAmount: user.investedAmount,
                totalProfit: user.totalProfit,
                todayProfit: 0, // Would be calculated from daily profit distributions
                totalWithdrawn: user.totalWithdrawn,
                totalDeposited: user.totalDeposited,
                activeInvestments,
                pendingTransactions,
                profitChange24h: 0,
                profitChange7d: 0,
                profitChange30d: 0,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ---------- GET /api/users/investments ----------
router.get('/investments', async (req: AuthRequest, res: Response) => {
    try {
        const investments = await prisma.investment.findMany({
            where: { userId: req.user!.id },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ investments });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch investments' });
    }
});

// ---------- GET /api/users/referrals ----------
router.get('/referrals', async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
        const referrals = await prisma.user.findMany({
            where: { referredBy: req.user!.id },
            select: {
                id: true, firstName: true, lastName: true,
                status: true, createdAt: true,
            },
        });

        res.json({ referralCode: user?.referralCode, referrals });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch referrals' });
    }
});

// ---------- PATCH /api/users/security/password ----------
router.patch('/security/password', async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user!.id } });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) return res.status(400).json({ error: 'Invalid current password' });

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash },
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// ---------- PATCH /api/users/security/2fa ----------
router.patch('/security/2fa', async (req: AuthRequest, res: Response) => {
    try {
        const { enabled } = req.body;
        await prisma.user.update({
            where: { id: req.user!.id },
            data: { twoFactorEnabled: enabled },
        });
        res.json({ message: `2FA ${enabled ? 'enabled' : 'disabled'} successfully` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle 2FA' });
    }
});

// ---------- POST /api/users/security/refresh-key ----------
router.post('/security/refresh-key', async (req: AuthRequest, res: Response) => {
    try {
        const newKey = Math.random().toString(36).substring(2, 14).toUpperCase();
        await prisma.user.update({
            where: { id: req.user!.id },
            data: { withdrawalKey: newKey },
        });
        res.json({ withdrawalKey: newKey });
    } catch (error) {
        res.status(500).json({ error: 'Failed to refresh withdrawal key' });
    }
});

// ---------- GET /api/users/security/sessions ----------
router.get('/security/sessions', async (req: AuthRequest, res: Response) => {
    try {
        const sessions = await prisma.refreshToken.findMany({
            where: { userId: req.user!.id },
            select: { id: true, device: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// ---------- DELETE /api/users/security/sessions/:id ----------
router.delete('/security/sessions/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.refreshToken.deleteMany({
            where: { id, userId: req.user!.id },
        });
        res.json({ message: 'Session terminated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to terminate session' });
    }
});

export default router;
