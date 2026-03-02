
import prisma from '../config/db.js';
import { createNotification } from './notification.service.js';

/**
 * Processes hourly profits for all active investments.
 * Calculates (Daily Rate / 24) * Investment Amount.
 * Updates user.totalProfit and investment.earnedProfit.
 * IMPORTANT: Per user request, this does NOT touch user.availableBalance or user.balance.
 */
export async function processHourlyProfits() {
    try {
        const now = new Date();

        // Find all active investments that are due for a profit update
        // Even if we check every hour, we might miss some due to server restarts, 
        // so we check if nextProfitDate is past or equal to now.
        const investments = await prisma.investment.findMany({
            where: {
                status: 'ACTIVE',
                nextProfitDate: {
                    lte: now
                }
            },
            include: {
                user: true
            }
        });

        if (investments.length === 0) return;

        console.log(`[PROFIT SERVICE] Processing hourly profit for ${investments.length} investments...`);

        for (const inv of investments) {
            // Calculate hourly profit: (Daily Rate / 100) * Amount / 24
            const dailyRate = inv.dailyProfitRate; // e.g. 0.5
            const hourlyRate = (dailyRate / 100) / 24;
            const hourlyProfit = inv.amount * hourlyRate;

            // Update user's total profit (WITHOUT touching balance/availableBalance)
            await prisma.user.update({
                where: { id: inv.userId },
                data: {
                    totalProfit: {
                        increment: hourlyProfit
                    }
                }
            });

            // Update investment's earned profit and set nextProfitDate to next hour
            // We set nextProfitDate to 1 hour after the previous one to ensure consistency even if processing is late
            const nextHour = new Date(inv.nextProfitDate.getTime() + 60 * 60 * 1000);

            await prisma.investment.update({
                where: { id: inv.id },
                data: {
                    earnedProfit: {
                        increment: hourlyProfit
                    },
                    nextProfitDate: nextHour,
                    lastProfitUpdate: now
                }
            });

            // Optional: Create a transaction record for the hourly profit
            // This might generate a LOT of rows. Maybe only log large updates or do it daily?
            // User requested hourly updates, let's keep it clean for now without a transaction log for every single hour 
            // unless they ask for it, to avoid DB bloat. 
            // Actually, a transaction log helps transparency. Let's add it but mark it clearly.

            /*
            await prisma.transaction.create({
                data: {
                    userId: inv.userId,
                    type: 'PROFIT',
                    amount: hourlyProfit,
                    status: 'COMPLETED',
                    description: `Hourly profit from ${inv.planId}`,
                    reference: `HRP-${Date.now()}-${inv.id.slice(-4)}`,
                    method: 'System',
                    processedAt: now
                }
            });
            */
        }

        console.log(`[PROFIT SERVICE] Hourly profit processing complete.`);
    } catch (error) {
        console.error('[PROFIT SERVICE] Error processing hourly profits:', error);
    }
}

/**
 * Initializes the profit service ticker.
 * Runs every 5 minutes to check for due profit updates.
 */
export function startProfitService() {
    console.log('[PROFIT SERVICE] Starting Profit Engine (Interval: Hourly)');

    // Run immediately on start
    processHourlyProfits();

    // Check every 5 minutes for any due investments
    setInterval(() => {
        processHourlyProfits();
    }, 5 * 60 * 1000);
}
