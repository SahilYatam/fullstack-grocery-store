import { prisma } from "../config/prisma.js";
import logger from "../shared/monitoring/logger.js";
import { ApiError } from "../shared/responses/ApiError.js";
import bcrypt from "bcrypt"

// Get admin dashboard data
const getAdminStats = async () => {
    const [
        totalOrders,
        totalUsers,
        totalProducts,
        outOfStock,
        totalPartners,
        recentOrders,
    ] = await Promise.all([
        prisma.order.count({
            where: {
                NOT: [
                    {
                        paymentMethod: "card",
                        isPaid: false,
                    },
                ],
            },
        }),

        prisma.user.count(),
        prisma.product.count(),
        prisma.product.count({
            where: { stock: 0 },
        }),
        prisma.deliveryPartner.count(),
        prisma.order.findMany({
            where: {
                NOT: [
                    {
                        paymentMethod: "card",
                        isPaid: false,
                    },
                ],
            },
            orderBy: { createdAt: "desc" },
            take: 8,
            include: {
                user: { select: { name: true, email: true } },
                deliveryPartner: { select: { name: true, phone: true } },
            },
        }),
    ]);

    return {
        totalOrders,
        totalUsers,
        totalProducts,
        outOfStock,
        totalPartners,
        recentOrders,
    };
};

// Get delivery partners list for admin
const getDeliveryPartners = async() => {
    const partners = await prisma.deliveryPartner.findMany({
        orderBy: {createdAt: "desc"}
    })

    return partners
}

// Create delivery partner profile
type DeliveryPartner = {
    name: string;
    email: string;
    password: string;
    phone: string;
    vehicalType: string;
}

const createDeliveryPartner = async(data: DeliveryPartner) => {
    if(!data.name || !data.email || !data.password || !data.phone){
        throw new ApiError(400, "Please provide all required fields");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const partner = await prisma.deliveryPartner.create({
        data: {
            name: data.name,
            email: data.email.toLowerCase(),
            password: hashedPassword,
            phone: data.phone,
            vehicleType: data.vehicalType,
        }
    })

    return partner
}

type UpdateDeliveryPartner = {
    name: string;
    phone: string;
    vehicalType: string;
    isActive: boolean;
}

const updateDeliveryPartner = async(id: string, updateData: UpdateDeliveryPartner) => {
    const data: any = {};

    if(updateData.name) data.name = updateData.name;
    if(updateData.phone) data.phone = updateData.phone;
    if(updateData.vehicalType) data.vehicalType = updateData.vehicalType;
    data.isActive = updateData.isActive;

    try {
        const partner = await prisma.deliveryPartner.update({
            where: {id},
            data
        })

        return partner
    } catch (error: any) {
        logger.error(error.message)
        throw new ApiError(404, "Partner not found");
    }
}

// Assign delivery partner for order
const assignDeliveryPartner = async(id: string, partnerId: string) => {
    const order = await prisma.order.findUnique({
        where: {id}
    })

    const partner = await prisma.deliveryPartner.findUnique({
        where: {id: partnerId}
    })

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    let status = order!.status;

    const history: any[] = Array.isArray(order!.statusHistory) ? order!.statusHistory : [];

    if(order!.status === "Placed" || order!.status === "Confirmed"){
        status = "Assigned";
        history.push({
            status: "Assigned",
            note: `Assigned to ${partner!.name}`,
            timestamp: new Date()
        })  
    }

    await prisma.order.update({
        where: {id},
        data: {
            deliveryPartnerId: partner!.id,
            deliveryOtp: otp,
            status,
            statusHistory: history
        }
    })

    return order
}


export const adminService = {
    getAdminStats,
    getDeliveryPartners,
    createDeliveryPartner,
    updateDeliveryPartner,
    assignDeliveryPartner
}
