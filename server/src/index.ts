import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import transactionRoutes from './routes/transactions.js';
import depositRoutes from './routes/deposits.js';
import withdrawalRoutes from './routes/withdrawals.js';
import notificationRoutes from './routes/notifications.js';
import investmentRoutes from './routes/investments.js';
import adminRoutes from './routes/admin.js';
import supportRoutes from './routes/support.js';
import kycRoutes from './routes/kyc.js';
import prisma from './config/db.js';

const app = express();

// --------------- Middleware ---------------
app.use(cors({
    origin: true, // Dynamically allow the requesting origin
    credentials: true,
}));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// --------------- Health Check ---------------
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health/seed', async (_req: Request, res: Response) => {
    try {
        const bcrypt = await import('bcryptjs');
        const hash = await bcrypt.default.hash('Admin@123', 12);
        const admin = await prisma.user.upsert({
            where: { email: 'admin@xvbwallet.com' },
            update: { passwordHash: hash, role: 'ADMIN', status: 'ACTIVE' },
            create: {
                email: 'admin@xvbwallet.com',
                passwordHash: hash,
                firstName: 'System',
                lastName: 'Administrator',
                balance: 1000000,
                availableBalance: 1000000,
                role: 'ADMIN',
                status: 'ACTIVE',
                emailVerified: true,
                kycStatus: 'VERIFIED',
                referralCode: 'ADMIN2024_NEW'
            }
        });
        res.json({ success: true, email: admin.email, role: admin.role, message: 'Admin forced successfully' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// --------------- API Routes ---------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/kyc', kycRoutes);

// --------------- Payment Methods (public) ---------------
app.get('/api/payment-methods', async (_req: Request, res: Response) => {
    try {
        const methods = await prisma.paymentMethod.findMany({
            where: { status: 'active' },
        });
        res.json({ methods });
    } catch {
        res.status(500).json({ error: 'Failed to fetch payment methods' });
    }
});

// --------------- Error Handler ---------------
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// --------------- Start Server ---------------
app.listen(env.PORT, () => {
    console.log(`\n🚀 Fintrivox API running at http://localhost:${env.PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}`);
    console.log(`   Frontend:    ${env.FRONTEND_URL}\n`);
});
