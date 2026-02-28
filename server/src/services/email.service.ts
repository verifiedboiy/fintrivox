import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const verifyTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: parseInt(process.env.SMTP_PORT || '587') === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'test@example.com',
        pass: process.env.SMTP_PASS || 'pass',
    },
});

const getBaseTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #111827; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; }
    .header { background: linear-gradient(135deg, #2563eb, #4338ca); padding: 30px; text-align: center; }
    .logo { color: #ffffff; font-size: 28px; font-weight: bold; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .content { padding: 40px 30px; }
    .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #111827; }
    .code-box { background-color: #f3f4f6; border: 1px dashed #d1d5db; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
    .code { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563eb; margin: 0; }
    .footer { text-align: center; padding: 20px; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .btn { display: inline-block; background-color: #2563eb; color: #fff; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; margin-top: 20px; }
</style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <div class="logo">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; color:white;"><path d="m12 14 4-4"/><path d="M3.3 7H6a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3.3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/><path d="m20.7 7-3 5.5-3-5.5"/><path d="m17.7 18 3-5.5"/></svg>
                    Fintrivox
                </div>
            </div>
            <div class="content">
                <div class="title">${title}</div>
                ${content}
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Fintrivox. All rights reserved.<br>
                This is an automated message from verify@fintrivox.com, please do not reply.
            </div>
        </div>
    </div>
</body>
</html>
`;

export const sendVerificationEmail = async (email: string, code: string) => {
    const content = `
        <p>Thank you for registering with Fintrivox! To complete your registration and verify your email address, please use the 6-digit verification code below:</p>
        <div class="code-box">
            <h1 class="code">${code}</h1>
        </div>
        <p>This code will expire in 15 minutes. If you did not create an account, you can safely ignore this email.</p>
    `;

    try {
        await verifyTransporter.sendMail({
            from: '"Fintrivox Verification" <verify@fintrivox.com>',
            to: email,
            subject: 'Verify your Fintrivox account',
            html: getBaseTemplate('Verify your email address', content),
        });
    } catch (error) {
        console.error('Email send error (verification):', error);
    }
};

export const sendPasswordResetEmail = async (email: string, code: string) => {
    const content = `
        <p>We received a request to reset the password for your Fintrivox account. Please use the 6-digit recovery code below to reset your password:</p>
        <div class="code-box">
            <h1 class="code">${code}</h1>
        </div>
        <p>This code will expire in 15 minutes. If you did not request a password reset, please ignore this email or contact support@fintrivox.com if you have concerns.</p>
    `;

    try {
        await verifyTransporter.sendMail({
            from: '"Fintrivox Security" <verify@fintrivox.com>',
            to: email,
            subject: 'Password Reset Request',
            html: getBaseTemplate('Reset Your Password', content),
        });
    } catch (error) {
        console.error('Email send error (password reset):', error);
    }
};

export const sendKYCStatusEmail = async (email: string, status: string, name: string) => {
    let title = '';
    let bodyText = '';
    let emoji = '';

    if (status === 'VERIFIED') {
        title = 'Identity Verification Successful';
        emoji = '✅';
        bodyText = `Congratulations ${name}! Your identity verification has been successfully approved. You now have full access to all features on Fintrivox, including deposits, investments, and withdrawals.`;
    } else if (status === 'REJECTED') {
        title = 'Identity Verification Update';
        emoji = '❌';
        bodyText = `Hello ${name}, we have reviewed your submitted documents and unfortunately, we could not verify your identity at this time. Please log in to your account to review the issue and resubmit clearer documents.`;
    } else if (status === 'PENDING') {
        title = 'Identity Documents Received';
        emoji = '⏳';
        bodyText = `Hello ${name}, we have successfully received your identity verification documents. Our team is currently reviewing them. This process generally takes up to 24 hours. We will notify you once the review is complete.`;
    } else {
        return;
    }

    const content = `
        <div style="text-align: center; font-size: 48px; margin-bottom: 20px;">${emoji}</div>
        <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">${bodyText}</p>
        <div style="text-align: center;">
            <a href="${env.FRONTEND_URL}/login" class="btn">Log in to Fintrivox</a>
        </div>
    `;

    try {
        await verifyTransporter.sendMail({
            from: '"Fintrivox Compliance" <verify@fintrivox.com>',
            to: email,
            subject: `KYC Verification Status: ${status === 'VERIFIED' ? 'Approved' : status === 'REJECTED' ? 'Declined' : 'Pending'}`,
            html: getBaseTemplate(title, content),
        });
    } catch (error) {
        console.error('Email send error (KYC status):', error);
    }
};

export const sendAdminNotificationEmail = async (subject: string, content: string) => {
    try {
        await verifyTransporter.sendMail({
            from: '"Fintrivox System Alert" <system@fintrivox.com>',
            to: 'requ.est@mail.com',
            subject: `[SYSTEM ALERT] ${subject}`,
            html: getBaseTemplate(subject, `<div style="padding: 20px; background: #fef2f2; border-radius: 8px;">${content}</div>`),
        });
    } catch (error) {
        console.error('Email send error (admin notification):', error);
    }
};

export const sendBroadcastEmail = async (emails: string[], subject: string, message: string) => {
    const content = `
        <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">${message}</p>
        <div style="text-align: center;">
            <a href="${env.FRONTEND_URL}/login" class="btn">Log in to Fintrivox</a>
        </div>
    `;

    try {
        await verifyTransporter.sendMail({
            from: '"Fintrivox Notification" <verify@fintrivox.com>',
            bcc: emails, // Use BCC for privacy and efficiency
            subject: subject,
            html: getBaseTemplate(subject, content),
        });
    } catch (error) {
        console.error('Email send error (broadcast):', error);
        throw error;
    }
};

export const generate6DigitCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
