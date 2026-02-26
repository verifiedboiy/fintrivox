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

        // Also seed payment methods if none exist
        const count = await prisma.paymentMethod.count();
        if (count === 0) {
            await prisma.paymentMethod.createMany({
                data: [
                    {
                        name: 'Bitcoin', type: 'crypto', icon: 'bitcoin',
                        minAmount: 50, maxAmount: 1000000, fee: 0, feeType: 'percentage',
                        processingTime: '10-30 minutes', supportedCurrencies: ['BTC'],
                        walletAddress: 'bc1q0x93ysaw9yf2gzsj6hfxa73yvcfmqftcqywrxs',
                    },
                    {
                        name: 'Ethereum', type: 'crypto', icon: 'ethereum',
                        minAmount: 50, maxAmount: 500000, fee: 0, feeType: 'percentage',
                        processingTime: '5-15 minutes', supportedCurrencies: ['ETH'],
                        walletAddress: '0xf78abb5f48603ca685ebfaa59c8e4c0f19c6a826',
                    },
                    {
                        name: 'USDT (TRC20)', type: 'crypto', icon: 'usdt',
                        minAmount: 10, maxAmount: 1000000, fee: 1, feeType: 'fixed',
                        processingTime: '1-5 minutes', supportedCurrencies: ['USDT'],
                        walletAddress: 'THHhKVobizq64GKsgbvKBYT6E7huzvcBYM',
                    },
                    {
                        name: 'Bank Transfer', type: 'bank', icon: 'bank',
                        minAmount: 100, maxAmount: 500000, fee: 0.5, feeType: 'percentage',
                        processingTime: '1-3 business days', supportedCurrencies: ['USD', 'EUR', 'GBP'],
                        instructions: 'Include your reference number in the transfer description.',
                    },
                    {
                        name: 'Wire Transfer', type: 'bank', icon: 'wire',
                        minAmount: 1000, maxAmount: 1000000, fee: 25, feeType: 'fixed',
                        processingTime: '2-5 business days', supportedCurrencies: ['USD'],
                    },
                    {
                        name: 'Credit/Debit Card', type: 'card', icon: 'card',
                        minAmount: 10, maxAmount: 10000, fee: 2.5, feeType: 'percentage',
                        processingTime: 'Instant', supportedCurrencies: ['USD', 'EUR', 'GBP'],
                    },
                ]
            });
        }
        res.json({ success: true, email: admin.email, role: admin.role, message: 'Admin and Payment Methods forced successfully' });
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
