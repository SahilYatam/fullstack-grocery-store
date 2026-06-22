import { prisma } from "../config/prisma.js";
import { ApiError } from "../shared/responses/ApiError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (id: string) => {
    return jwt.sign({ id, role: "delivery" }, process.env.JWT_SECRET as string, {
        expiresIn: "30d",
    });
};

// Login delivery partner
const loginPartner = async (email: string, password: string) => {
    if (!email || !password) {
        throw new ApiError(400, "Please provide email and password");
    }

    const partner = await prisma.deliveryPartner.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (!partner) {
        throw new ApiError(401, "Invalid email or password");
    }
    if (!partner.isActive) {
        throw new ApiError(403, "Your account has been deactivated");
    }

    const isMatch = await bcrypt.compare(password, partner.password);

    if (!isMatch) throw new ApiError(401, "Invalid email or password");

    const token = generateToken(partner.id);
    const { password: _, ...partnerData } = partner;

    return { partner: partnerData, token };
};

// Get assigned deliveries
// status: req.query
const getMyDeliveries = async (status: string, deliveryPartnerId: string) => {
    const where: any = { deliveryPartnerId };

    if (status === "active") {
        where.status = { in: ["Assigned", "Packed", "Out for Delivery"] };
    } else if (status === "completed") {
        where.status = { in: ["Delivered", "Cancelled"] };
    }

    const order = await prisma.order.findMany({
        where,
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return order;
};

// Get single delivery detail
const getDeliveryDetail = async (id: string, deliveryPartnerId: string) => {
    const order = await prisma.order.findFirst({
        where: { id, deliveryPartnerId },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });

    if (!order) {
        throw new ApiError(404, "Delivery not found");
    }

    return order;
};

// Complete delivery with OTP
const completeDelivery = async (
    id: string,
    deliveryPartnerId: string,
    otp: string,
) => {
    const order = await prisma.order.findFirst({
        where: {
            id,
            deliveryPartnerId,
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.status === "Cancelled" || order.status === "Delivered") {
        throw new ApiError(400, "Invalid Request");
    }

    if (order.deliveryOtp !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    const history = order.statusHistory as any[];

    history.push({
        status: "Delivered",
        note: "Delivered by partner",
        timestamp: new Date(),
    });

    const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: "Delivered", statusHistory: history, deliveryOtp: "" },
    });

    return { order: updatedOrder };
};

const cancelDelivery = async (
    id: string,
    deliveryPartnerId: string,
    reason: string,
) => {
    const order = await prisma.order.findFirst({
        where: { id, deliveryOtp: deliveryPartnerId },
    });

    if (order!.status === "Delivered") {
        throw new ApiError(400, "Cannot cancel a delivered order");
    }

    const history = order!.statusHistory as any[];

    history.push({
        status: "Cancelled",
        note: reason || "",
        timestamp: new Date(),
    });

    const updatedOrder = await prisma.order.update({
        where: { id: order?.id },
        data: { status: "Cancelled", statusHistory: history },
    });

    return { order: updatedOrder };
};

const updateDeliveryStatus = async (
    status: string,
    id: string,
    deliveryPartnerId: string,
) => {
    const allowedStatuses = ["Packed", "Out for Delivery"];

    if (!allowedStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status update");
    }

    const order = await prisma.order.findFirst({
        where: { id, deliveryPartnerId },
    });

    const history = order!.statusHistory as any[];

    history.push({
        status,
        note: `Status updated to ${status}`,
        timestamp: new Date(),
    });

    const updatedOrder = await prisma.order.update({
        where: { id: order!.id },
        data: { status, statusHistory: history },
    });

    return { order: updatedOrder };
};

const updateLiveLocation = async (
    id: string,
    deliveryPartnerId: string,
    lat: string,
    lng: string,
) => {
    const order = await prisma.order.findFirst({
        where: {
            id,
            deliveryPartnerId,
            status: { in: ["Assigned", "Packed", "Out for Delivery"] },
        },
    });

    await prisma.order.update({
        where: { id: order!.id },
        data: {
            liveLocation: { lat, lng, updatedAt: new Date() },
        },
    });

    return { success: true };
};

export const deliveryPartnerService = {
    loginPartner,
    getMyDeliveries,
    getDeliveryDetail,
    completeDelivery,
    cancelDelivery,
    updateDeliveryStatus,
    updateLiveLocation,
};
