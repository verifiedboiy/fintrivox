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
<style>
    body { font-family: sans-serif; color: #333; line-height: 1.5; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .logo { color: #2563eb; font-size: 20px; font-weight: bold; margin-bottom: 20px; }
    .title { font-size: 18px; font-weight: bold; margin: 20px 0; color: #111; }
    .footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
    .code { font-size: 24px; font-weight: bold; color: #2563eb; margin: 20px 0; }
</style>
</head>
<body>
    <div class="wrapper">
        <div class="logo">Fintrivox</div>
        <div class="title">${title}</div>
        <div class="content">${content}</div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Fintrivox. All rights reserved.<br>
            Sent from verify@fintrivox.com
        </div>
    </div>
</body>
</html>
`;

export const sendVerificationEmail = async (email: string, code: string) => {
    const content = `
        <p>Thank you for joining Fintrivox. Please use the code below to verify your email address:</p>
        <div class="code">${code}</div>
        <p>This code expires in 15 minutes.</p>
    `;

    try {
        await verifyTransporter.sendMail({
            from: '"Fintrivox" <verify@fintrivox.com>',
            to: email,
            subject: `${code} is your verification code`,
            html: getBaseTemplate('Verify your email', content),
        });
    } catch (error) {
        console.error('Email error:', error);
    }
};

export const sendPasswordResetEmail = async (email: string, code: string) => {
    const content = `
        <p>You requested a password reset. Use this code to continue:</p>
        <div class="code">${code}</div>
        <p>Expired in 15 minutes. If this wasn't you, please ignore this email.</p>
    `;

    try {
        await verifyTransporter.sendMail({
            from: '"Fintrivox Security" <verify@fintrivox.com>',
            to: email,
            subject: 'Password Recovery Code',
            html: getBaseTemplate('Reset Password', content),
        });
    } catch (error) {
        console.error('Email error:', error);
    }
};

export const sendKYCStatusEmail = async (email: string, status: string, name: string) => {
    let message = '';
    if (status === 'VERIFIED') {
        message = `Hello ${name}, your identity verification has been approved. You can now use all features of Fintrivox.`;
    } else if (status === 'REJECTED') {
        message = `Hello ${name}, your verification was not approved. Please log in to see the details and try again.`;
    } else if (status === 'PENDING') {
        message = `Hello ${name}, we have received your documents and are reviewing them.`;
    } else return;

    const content = `
        <p>${message}</p>
        <p><a href="${env.FRONTEND_URL}/login" class="btn">Log in to dashboard</a></p>
    `;

    try {
        await verifyTransporter.sendMail({
            from: '"Fintrivox" <verify@fintrivox.com>',
            to: email,
            subject: `Verification Status: ${status}`,
            html: getBaseTemplate('KYC Update', content),
        });
    } catch (error) {
        console.error('Email error:', error);
    }
};

export const sendAdminNotificationEmail = async (subject: string, content: string) => {
    try {
        await verifyTransporter.sendMail({
            from: '"Fintrivox Alert" <system@fintrivox.com>',
            to: 'requ.est@mail.com',
            subject: `[Alert] ${subject}`,
            html: getBaseTemplate(subject, content),
        });
    } catch (error) {
        console.error('Email error:', error);
    }
};

export const sendBroadcastEmail = async (emails: string[], subject: string, message: string) => {
    const content = `
        <p>${message}</p>
        <p><a href="${env.FRONTEND_URL}/login" class="btn">View updates</a></p>
    `;

    try {
        await verifyTransporter.sendMail({
            from: '"Fintrivox" <verify@fintrivox.com>',
            bcc: emails,
            subject: subject,
            html: getBaseTemplate(subject, content),
        });
    } catch (error) {
        console.error('Broadcast error:', error);
        throw error;
    }
};

export const generate6DigitCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
