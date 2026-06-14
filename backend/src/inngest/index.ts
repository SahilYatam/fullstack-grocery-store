import { cron, Inngest } from "inngest";
import { prisma } from "../config/prisma";
import sendEmail from "../config/nodemailer";
import {
    LOW_STOCK_EMAIL,
    OFFER_EMAIL,
} from "../shared/templates/emailTemplates";

const LOW_STOCK_THRESHOLD = 10;

export const inngest = new Inngest({ id: "e-grocery-delivery" });

// Low stock alreat to admin email
const checkLowStock = inngest.createFunction(
    {
        id: "check-low-stock",
        name: "Low Stock Alert",
        triggers: [{ event: "inventory/stock.updated" }],
    },
    async ({ event, step }) => {
        const { productId } = event.data;

        const product = await step.run("fetch-product", async () => {
            return await prisma.product.findUnique({
                where: { id: productId },
            });
        });

        if (
            !product ||
            product.stock === null ||
            product.stock >= LOW_STOCK_THRESHOLD
        ) {
            return { skipped: true, stock: product?.stock };
        }

        await step.run("send-low-stock-email", async () => {
            const adminEmails = process.env.ADMIN_EMAILS
                ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim())
                : [];

            if (adminEmails.length === 0) {
                return { skipped: true, reason: "No admin emails" };
            }

            await sendEmail({
                to: adminEmails.join(","),
                subject: `Low Stock Alert: ${product.name}`,
                body: LOW_STOCK_EMAIL(product),
            });
        });

        return { alerted: true, product: product.name, stock: product.stock };
    },
);

// Monthly offers email (1st of every month - payday)
const sendMonthlyOffers = inngest.createFunction(
    {
        id: "send-monthl-offers",
        name: "Monthly Payday Offers",
        triggers: [cron("0 10 1 * *")],
    },
    async ({ step }) => {
        const { deals, users } = await step.run(
            "fetch-deals-and-users",
            async () => {
                // Get top discounted products as discount deals
                const products = await prisma.product.findMany({
                    where: { stock: { gt: 0 } },
                    orderBy: { originalPrice: "desc" },
                    take: 6,
                });

                const allUsers = await prisma.user.findMany({
                    select: { name: true, email: true },
                });
                return { deals: products, users: allUsers };
            },
        );

        if (users.length === 0 || deals.length === 0) {
            return {
                skipped: true,
                reason: "No users or deals",
            };
        }

        let sentCount = 0;

        // Send in batches of 10 to avoid overwhelming mail server
        const batcheSize = 10;
        for (let i = 0; i < users.length; i += batcheSize) {
            const batch = users.slice(i, i + batcheSize);

            await step.run(`send-offers-batch-${i}`, async () => {
                for (const u of batch) {
                    await sendEmail({
                        to: u.email,
                        subject: `Fresh Picks Just For You!`,
                        body: OFFER_EMAIL(u, deals),
                    });
                }
            });
            sentCount += batch.length;
        }
        return { sent: sentCount };
    },
);

// Auto-Assign rider after 5 minutes
const autoAssignRider = inngest.createFunction(
    {
        id: "auto-assign-rider",
        name: "Auto Assign Delivery Rider",
        triggers: [{ event: "order/placed" }],
    },
    async ({ event, step }) => {
        const { orderId } = event.data;

        // Wait 5 minutes before attempting assignment
        await step.sleep("wait-5-min", "5m");

        const result = await step.run("assign-rider", async () => {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
            });

            // Skip if order doesn't exist, already assigned or cancelled
            if (!order) return { skipped: true, reason: "Order not found" };

            if (order.deliveryPartnerId)
                return { skipped: true, reason: "Order already assigned" };

            if (["Cancelled", "Delivered"].includes(order.status as string))
                return { skipped: true, reason: `Order is ${order.status}` };

            // Find an active rider not currently delivering
            const busyOrders = await prisma.order.findMany({
                where: {
                    status: { in: ["Assigned", "Packed", "Out for Delivery"] },
                    deliveryPartnerId: { not: null },
                },
                select: {
                    deliveryPartnerId: true,
                },
            });

            const busyRidersIds = busyOrders.map((o) => o.deliveryPartnerId);

            const availableRiders = await prisma.deliveryPartner.findFirst({
                where: {
                    isActive: true,
                    id: { notIn: busyRidersIds as string[] },
                },
            });

            if (!availableRiders)
                return { skipped: true, reason: "No riders available" };

            // Generate 6 digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            const history = (
                Array.isArray(order.statusHistory) ? order.statusHistory : []
            ) as any[];

            history.push({
                status: "Assigned",
                note: `Auto-assigned to ${availableRiders.name}`,
                timestamp: new Date(),
            });

            await prisma.order.update({
                where: { id: orderId },
                data: {
                    deliveryPartnerId: availableRiders.id,
                    deliveryOtp: otp,
                    status: "Assigned",
                    statusHistory: history,
                },
            });

            return {
                assigned: true,
                riderId: availableRiders.id,
                riderName: availableRiders.name,
                orderId: orderId,
            };
        });

        return result;
    },
);

export const functions = [checkLowStock, sendMonthlyOffers, autoAssignRider];
