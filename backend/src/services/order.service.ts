import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../shared/responses/ApiError";

type OrderItemInput = {
    product: string;
    quantity: number;
};

const createOrder = async (
    items: OrderItemInput[],
    addressId: string,
    paymentMethod: "card" | "cod",
    userId: string,
) => {
    if (!items || items.length === 0) {
        throw new ApiError(400, "No order items");
    }
    const address = await prisma.address.findFirst({
        where: {
            id: addressId,
            userId,
        },
    });

    if (!address) {
        throw new ApiError(404, "Address not found");
    }

    const productIds = items.map((item) => item.product);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    for (const item of items) {
        if (item.quantity <= 0) {
            throw new ApiError(400, "Quantity must be greater than 0");
        }

        const product = productMap.get(item.product);

        if (!product) {
            throw new ApiError(400, `Product ${item.product} not found`);
        }

        if ((product.stock ?? 0) < item.quantity) {
            throw new ApiError(400, `${product.name} is out of stock`);
        }
    }

    const orderItems = items.map((item) => {
        const product = productMap.get(item.product);

        return {
            product: product?.id,
            name: product?.name,
            image: product?.image,
            price: product?.price,
            quantity: item.quantity,
            unit: product?.unit,
        };
    });

    const subtotal = orderItems.reduce(
        (sum, item: any) => sum + item.price * item.quantity,
        0,
    );
    const deliveryFee = subtotal >= 20 ? 0 : 1.99;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

    const order = await prisma.$transaction(async (tx) => {
        const createOrder = await tx.order.create({
            data: {
                userId,
                items: orderItems as Prisma.JsonArray,

                shippingAddress: {
                    label: address.label,
                    address: address.address,
                    city: address.city,
                    state: address.state,
                    zip: address.zip,
                    lat: address.lat,
                    lng: address.lng,
                } as Prisma.JsonObject,

                paymentMethod,
                subtotal,
                deliveryFee,
                tax,
                total,

                statusHistory: [
                    {
                        status: "Placed",
                        note: "Order placed successfully",
                        timestamp: new Date(),
                    },
                ],
            },
        });

        for (const item of orderItems) {
            await tx.product.update({
                where: { id: item.product },
                data: {
                    stock: { decrement: item.quantity },
                },
            });
        }
        return createOrder;
    });

    // Stripe payment link logic later
    if (paymentMethod === "card") {
        // TODO
    }

    return order;
};

const getUserOrders = async (status: string, userId: string) => {
    const where: any = {
        userId,
        NOT: [{ paymentMethod: "card", isPaid: false }],
    };

    if (status && status !== "all") {
        where.status = status;
    }

    const orders = await prisma.order.findMany({
        where,
        include: { deliveryPartner: { select: { name: true, phone: true } } },
        orderBy: { createdAt: "desc" },
    });
    return orders;
};

const getOrder = async (id: string, userId: string) => {
    const order = await prisma.order.findFirst({
        where: { id, userId },
        include: {
            deliveryPartner: {
                select: { name: true, phone: true, avatar: true, vehicleType: true },
            },
        },
    });
    if (!order) throw new ApiError(404, "Order not found");

    return order;
};

// update order status (admin)
const updateOrderStatus = async (id: string, status: string, note: string) => {
    const order = await prisma.order.findUnique({
        where: { id },
    });
    if (!order) throw new ApiError(404, "Order not found");

    const history = (
        Array.isArray(order.statusHistory) ? order.statusHistory : []
    ) as any[];
    history.push({
        status,
        note: note || `Order ${status.toLowerCase()}`,
        timestamp: new Date(),
    });

    const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status, statusHistory: history },
    });

    return updatedOrder;
};

const getAllOrders = async() => {
    const orders = await prisma.order.findMany({
        where: {NOT: [{paymentMethod: "card", isPaid: false}]},
        include: {
            user: {select: {name: true, email: true}},
            deliveryPartner: {
                select: { name: true, phone: true, email: true},
            },
        },
        orderBy: {createdAt: "desc"}
    })

    return orders
}

const getOrderLocation = async(id: string, userId: string) => {
    const order = await prisma.order.findFirst({
        where: {id, userId},
        select: {liveLocation: true, status: true}
    })

    if (!order) throw new ApiError(404, "Order not found");

    return {
        liveLocation: order.liveLocation,
        status: order.status
    }
}

export const orderService = {
    createOrder,
    getUserOrders,
    getOrder,
    updateOrderStatus,
    getAllOrders,
    getOrderLocation
};
