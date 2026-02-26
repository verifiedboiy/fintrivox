// @ts-nocheck
import { Router, Response } from 'express';
import prisma from '../config/db.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { createNotification } from '../services/notification.service.js';
import { sendKYCStatusEmail, sendAdminNotificationEmail } from '../services/email.service.js';

const router = Router();
router.use(requireAuth as any);

// POST /api/kyc/submit — submit KYC documents
router.post('/submit', async (req: AuthRequest, res: Response) => {
    try {
        const { documentType, documentNumber, frontImage, backImage, selfieImage, selfieVideo } = req.body;
        const userId = req.user!.id;

        // Map frontend document type strings to KycDocType enum values
        const docTypeMap: Record<string, string> = {
            passport: 'PASSPORT',
            national_id: 'ID_CARD',
            id_card: 'ID_CARD',
            drivers_license: 'DRIVER_LICENSE',
            driver_license: 'DRIVER_LICENSE',
            ssn_card: 'ID_CARD',
            utility_bill: 'UTILITY_BILL',
            bank_statement: 'BANK_STATEMENT',
        };
        const normalizedDocType = docTypeMap[documentType?.toLowerCase()] || documentType?.toUpperCase();

        // Check if already verified
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.kycStatus === 'VERIFIED') {
            res.status(400).json({ error: 'KYC already verified' });
            return;
        }

        // Create or update KYC document
        const existingDoc = await prisma.kycDocument.findFirst({ where: { userId } });
        let doc;
        if (existingDoc) {
            doc = await prisma.kycDocument.update({
                where: { id: existingDoc.id },
                data: {
                    type: normalizedDocType as any,
                    documentNumber,
                    frontImage,
                    backImage: backImage || null,
                    selfieImage: selfieImage || null,
                    selfieVideo: selfieVideo || null,
                    status: 'pending',
                    rejectionReason: null,
                },
            });
        } else {
            doc = await prisma.kycDocument.create({
                data: {
                    userId,
                    type: normalizedDocType as any,
                    documentNumber,
                    frontImage,
                    backImage: backImage || null,
                    selfieImage: selfieImage || null,
                    selfieVideo: selfieVideo || null,
                    status: 'pending',
                },
            });
        }

        // Update user KYC status
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { kycStatus: 'PENDING', kycSubmittedAt: new Date() },
        });

        sendKYCStatusEmail(updatedUser.email, 'PENDING', updatedUser.firstName).catch(console.error);

        // Notify admin via email
        await sendAdminNotificationEmail(
            `New KYC Submission: ${user?.firstName} ${user?.lastName}`,
            `<p><strong>User:</strong> ${user?.firstName} ${user?.lastName} (${user?.email})</p>
             <p><strong>Document Type:</strong> ${normalizedDocType}</p>
             <p><strong>Document Number:</strong> ${documentNumber || 'N/A'}</p>
             <p>A new KYC submission is pending review in the admin panel.</p>`
        );

        await createNotification({
            userId,
            title: 'KYC Submitted',
            message: 'Your KYC documents have been submitted and are under review.',
            type: 'INFO',
            link: '/dashboard/kyc',
        });

        res.status(201).json({ document: doc });
    } catch (error) {
        console.error('KYC submit error:', error);
        res.status(500).json({ error: 'Failed to submit KYC' });
    }
});

// GET /api/kyc/status — get user's KYC status
router.get('/status', async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { kycStatus: true, kycSubmittedAt: true },
        });
        const doc = await prisma.kycDocument.findFirst({
            where: { userId: req.user!.id },
            orderBy: { uploadedAt: 'desc' },
        });
        res.json({ kycStatus: user?.kycStatus, kycSubmittedAt: user?.kycSubmittedAt, document: doc });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch KYC status' });
    }
});

export default router;
