import { Request, Response } from "express";
import { deliveryPartnerService } from "../services/deliveryPartner.service.js";
import { asyncHandler } from "../shared/handlers/asyncHandler.js";
import { ApiResponse } from "../shared/responses/ApiResponse.js";

const loginPartner = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { partner, token } = await deliveryPartnerService.loginPartner(
        email,
        password,
    );

    return res
        .status(200)
        .json(new ApiResponse(200, { partner, token }, "Login successfull"));
});

const getMyDeliveries = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;
    const deliveryPartnerId = req.partner?.id;

    const order = await deliveryPartnerService.getMyDeliveries(
        status as string,
        deliveryPartnerId as string,
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, order, "Deliveries details fetched successfully"),
        );
});

const getDeliveryDetail = asyncHandler(async (req: Request, res: Response) => {
    const deliveryPartnerId = req.partner?.id;

    const order = await deliveryPartnerService.getDeliveryDetail(
        req.params.id as string,
        deliveryPartnerId as string,
    );

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Delivery detail fetched successfully"));
});

const completeDelivery = asyncHandler(async (req: Request, res: Response) => {
    const {otp}= req.body
    const deliveryPartnerId = req.partner?.id;

    const order = await deliveryPartnerService.completeDelivery(
        req.params.id as string,
        deliveryPartnerId as string,
        otp
    );

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Delivery completed"));
});

const cancelDelivery = asyncHandler(async (req: Request, res: Response) => {
    const {reason}= req.body
    const deliveryPartnerId = req.partner?.id;

    const order = await deliveryPartnerService.completeDelivery(
        req.params.id as string,
        deliveryPartnerId as string,
        reason
    );

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Delivery cancelled"));
});

const updateDeliveryStatus = asyncHandler(async (req: Request, res: Response) => {
    const {status}= req.body
    const deliveryPartnerId = req.partner?.id;

    const order = await deliveryPartnerService.updateDeliveryStatus(
        status,
        req.params.id as string,
        deliveryPartnerId as string,
    );

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Delivery status updated"));
});

const updateLiveLocation = asyncHandler(async (req: Request, res: Response) => {
    const {lat, lng}= req.body
    const deliveryPartnerId = req.partner?.id;

    const {success} = await deliveryPartnerService.updateLiveLocation(
        req.params.id as string,
        deliveryPartnerId as string,
        lat,
        lng
    );

    return res
        .status(200)
        .json(new ApiResponse(200, success, "Live location updated"));
});

export const deliveryPartnerController = {
    loginPartner,
    getMyDeliveries,
    getDeliveryDetail,
    completeDelivery,
    cancelDelivery,
    updateDeliveryStatus,
    updateLiveLocation
};
