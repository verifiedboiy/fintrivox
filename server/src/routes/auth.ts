// @ts-nocheck
import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db.js';
import { env } from '../config/env.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { createNotification } from '../services/notification.service.js';
import { sendVerificationEmail, sendPasswordResetEmail, generate6DigitCode } from '../services/email.service.js';

const router = Router();

// ---------- Schemas ----------
const registerSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    country: z.string().optional(),
    referralCode: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

// ---------- Helpers ----------
function generateTokens(user: { id: string; email: string; role: string }) {
    const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
}

// ---------- Routes ----------

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res: Response) => {
    try {
        const { email, password, firstName, lastName, phone, country, referralCode } = req.body;
        const normalizedEmail = email.toLowerCase();
        console.log(`[AUTH] Register attempt: ${email} -> ${normalizedEmail}`);

        // Check if email exists
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
            console.log(`[AUTH] Register failed: Email already exists (${normalizedEmail})`);
            res.status(400).json({ error: 'Email already registered' });
            return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Find referrer
        let referredBy: string | undefined;
        if (referralCode) {
            const referrer = await prisma.user.findUnique({ where: { referralCode } });
            if (referrer) {
                referredBy = referrer.id;
            }
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                passwordHash,
                firstName,
                lastName,
                phone,
                country,
                referredBy,
            },
        });

        // Generate tokens
        const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

        // Save refresh token
        await prisma.refreshToken.create({
            data: {
                token: tokens.refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        // Create welcome notification
        await createNotification({
            userId: user.id,
            title: 'Welcome to Fintrivox!',
            message: 'Your account has been created successfully. Complete your KYC to start investing.',
            type: 'SUCCESS',
            link: '/dashboard/kyc',
        });

        // Update user to require verification and generate code
        const code = generate6DigitCode();
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerificationCode: code,
                emailCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000)
            }
        });

        // Fire and forget email
        sendVerificationEmail(user.email, code).catch(console.error);

        const { passwordHash: _, ...safeUser } = user;

        res.status(201).json({
            user: safeUser,
            success: true
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res: Response) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            console.log(`[AUTH] Login failed: User not found (${normalizedEmail})`);
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        if (user.status === 'SUSPENDED') {
            console.log(`[AUTH] Login failed: Account suspended (${email})`);
            res.status(403).json({ error: 'Account has been suspended' });
            return;
        }

        // Verify password
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            console.log(`[AUTH] Login failed: Invalid password (${email})`);
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        if (!user.emailVerified) {
            console.log(`[AUTH] Login: Email not verified (${email})`);
            // Need to ensure there's an active code
            if (!user.emailCodeExpiresAt || user.emailCodeExpiresAt < new Date()) {
                const code = generate6DigitCode();
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        emailVerificationCode: code,
                        emailCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000)
                    }
                });
                sendVerificationEmail(user.email, code).catch(console.error);
            }
            res.json({ requiresEmailVerification: true, email: user.email });
            return;
        }

        // Check if 2FA is required (bypass for demo account)
        const isDemo = user.email === 'john.doe@example.com';
        if (user.twoFactorEnabled && !isDemo) {
            console.log(`[AUTH] Login: 2FA required (${email})`);
            // Return a temporary token for 2FA verification
            const tempToken = jwt.sign(
                { userId: user.id, purpose: '2fa' },
                env.JWT_SECRET,
                { expiresIn: '5m' }
            );
            res.json({ requires2FA: true, tempToken });
            return;
        }

        console.log(`[AUTH] Login successful: ${email}`);
        // Generate tokens
        const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

        // Save refresh token
        await prisma.refreshToken.create({
            data: {
                token: tokens.refreshToken,
                userId: user.id,
                device: req.headers['user-agent'],
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        const { passwordHash: _, ...safeUser } = user;

        res.json({
            user: safeUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/verify-2fa
router.post('/verify-2fa', async (req, res: Response) => {
    try {
        const { tempToken, code } = req.body;

        if (!tempToken || !code) {
            res.status(400).json({ error: 'Missing token or code' });
            return;
        }

        // Verify temp token
        const payload = jwt.verify(tempToken, env.JWT_SECRET) as { userId: string; purpose: string };
        if (payload.purpose !== '2fa') {
            res.status(400).json({ error: 'Invalid token' });
            return;
        }

        // Mock 2FA verification (in production, use TOTP with speakeasy)
        if (!/^\d{6}$/.test(code)) {
            res.status(400).json({ error: 'Invalid 2FA code' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

        await prisma.refreshToken.create({
            data: {
                token: tokens.refreshToken,
                userId: user.id,
                device: req.headers['user-agent'],
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        const { passwordHash: _, ...safeUser } = user;

        res.json({
            user: safeUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    } catch {
        res.status(401).json({ error: 'Invalid or expired 2FA token' });
    }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ error: 'Refresh token required' });
            return;
        }

        // Verify token
        const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };

        // Check if token exists in DB
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            // Delete expired token
            if (storedToken) {
                await prisma.refreshToken.delete({ where: { id: storedToken.id } });
            }
            res.status(401).json({ error: 'Invalid or expired refresh token' });
            return;
        }

        const user = storedToken.user;

        // Delete old token and create new one (token rotation)
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });

        const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

        await prisma.refreshToken.create({
            data: {
                token: tokens.refreshToken,
                userId: user.id,
                device: req.headers['user-agent'],
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        const { passwordHash: _, ...safeUser } = user;

        res.json({
            user: safeUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    } catch {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { refreshToken } = req.body;

        // Delete the refresh token
        if (refreshToken) {
            await prisma.refreshToken.deleteMany({
                where: { token: refreshToken, userId: req.user!.id },
            });
        }

        // Delete all tokens for this user (logout everywhere)
        // Uncomment this for "logout all sessions":
        // await prisma.refreshToken.deleteMany({ where: { userId: req.user!.id } });

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// GET /api/auth/me — get current user
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true, email: true, firstName: true, lastName: true,
                phone: true, country: true, address: true, city: true, postalCode: true,
                dateOfBirth: true, balance: true, availableBalance: true, investedAmount: true,
                totalProfit: true, totalWithdrawn: true, totalDeposited: true,
                role: true, status: true, emailVerified: true, twoFactorEnabled: true,
                kycStatus: true, kycSubmittedAt: true, referralCode: true, referredBy: true,
                createdAt: true, lastLogin: true,
            },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ user });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// POST /api/auth/send-verification
router.post('/send-verification', async (req, res: Response) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email?.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user || user.emailVerified) {
            res.status(400).json({ error: 'User already verified or not found' });
            return;
        }

        const code = generate6DigitCode();
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerificationCode: code,
                emailCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000)
            }
        });

        sendVerificationEmail(user.email, code).catch(console.error);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res: Response) => {
    try {
        const { email, code } = req.body;
        const normalizedEmail = email?.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (!user || user.emailVerified) {
            res.status(400).json({ error: 'Invalid operation' });
            return;
        }

        if (user.emailVerificationCode !== code || !user.emailCodeExpiresAt || user.emailCodeExpiresAt < new Date()) {
            res.status(400).json({ error: 'Invalid or expired code' });
            return;
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerificationCode: null,
                emailCodeExpiresAt: null
            }
        });

        await createNotification({
            userId: user.id,
            title: 'Email Verified',
            message: 'Your email address has been successfully verified.',
            type: 'SUCCESS'
        });

        const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

        await prisma.refreshToken.create({
            data: {
                token: tokens.refreshToken,
                userId: user.id,
                device: req.headers['user-agent'],
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        const { passwordHash: _, ...safeUser } = user;

        res.json({
            user: safeUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            success: true,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res: Response) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email?.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (user) {
            const code = generate6DigitCode();
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordResetCode: code,
                    resetCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000)
                }
            });
            sendPasswordResetEmail(user.email, code).catch(console.error);
        }

        // Always return success to prevent email enumeration
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// POST /api/auth/verify-reset-code — check if reset code is valid WITHOUT consuming it
router.post('/verify-reset-code', async (req, res: Response) => {
    try {
        const { email, code } = req.body;
        const normalizedEmail = email?.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user || user.passwordResetCode !== code || !user.resetCodeExpiresAt || user.resetCodeExpiresAt < new Date()) {
            res.status(400).json({ error: 'Invalid, expired, or incorrect code' });
            return;
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res: Response) => {
    try {
        const { email, code, newPassword } = req.body;
        const normalizedEmail = email?.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user || user.passwordResetCode !== code || !user.resetCodeExpiresAt || user.resetCodeExpiresAt < new Date()) {
            res.status(400).json({ error: 'Invalid or expired code' });
            return;
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                passwordResetCode: null,
                resetCodeExpiresAt: null
            }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
