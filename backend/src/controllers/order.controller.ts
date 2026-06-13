import { Request, Response } from "express";
import { orderService } from "../services/order.service";
import { asyncHandler } from "../shared/handlers/asyncHandler";
import { ApiResponse } from "../shared/responses/ApiResponse";

const createOrder = asyncHandler(async (req: Request, res: Response) => {
    const { items, addressId, paymentMethod } = req.body;

    const order = await orderService.createOrder(
        items,
        addressId,
        paymentMethod,
        req.user?.id as string,
    );

    return res
        .status(201)
        .json(new ApiResponse(201, order, "Order created successfully"));
});

const getUserOrders = asyncHandler(async(req: Request, res: Response) => {

    const {status} = req.body

    const orders = await orderService.getUserOrders(
        status, req.user?.id as string
    )

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "User orders fetched successfully"));
})

const getOrder = asyncHandler(async(req: Request, res: Response) => {
    const order = await orderService.getOrder(
        req.params.id as string,
        req.user?.id as string
    )

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order fetched successfully"));
})

const updateOrderStatus = asyncHandler(async(req: Request, res: Response) => {
    const {status, note} = req.body

    const updatedOrder = await orderService.updateOrderStatus(
        req.params.id as string,
        status,
        note
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedOrder, "Order status updated successfully"));
})

const getAllOrders = asyncHandler(async(req: Request, res: Response) => {
    const orders = await orderService.getAllOrders()


    return res
        .status(200)
        .json(new ApiResponse(200, orders, "All order fetched successfully"));
})

const getOrderLocation = asyncHandler(async(req: Request, res: Response) => {
    const {liveLocation, status} = await orderService.getOrderLocation(
        req.params.id as string,
        req.user?.id as string
    )


    return res
        .status(200)
        .json(new ApiResponse(200, {liveLocation, status}, "All order fetched successfully"));
})


export const orderController = {
    createOrder,
    getUserOrders,
    getOrder,
    updateOrderStatus,
    getAllOrders,
    getOrderLocation
}
