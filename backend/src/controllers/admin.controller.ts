import { Request, Response } from "express";
import { adminService } from "../services/admin.service";
import { asyncHandler } from "../shared/handlers/asyncHandler";
import { ApiResponse } from "../shared/responses/ApiResponse";

const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
    const {
        totalOrders,
        totalUsers,
        totalProduct,
        outOfStock,
        totalPartners,
        recentOrders,
    } = await adminService.getAdminStats();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalOrders,
                totalUsers,
                totalProduct,
                outOfStock,
                totalPartners,
                recentOrders,
            },
            "Stats fetched successfully",
        ),
    );
});

const getDeliveryPartners = asyncHandler(
    async (req: Request, res: Response) => {
        const partners = await adminService.getDeliveryPartners();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    partners,
                    "Delivery partners fetched successfully",
                ),
            );
    },
);

const createDeliveryPartner = asyncHandler(
    async (req: Request, res: Response) => {
        const { name, email, password, phone, vehicalType } = req.body;

        const partner = await adminService.createDeliveryPartner({
            name,
            email,
            password,
            phone,
            vehicalType,
        });

        return res
            .status(200)
            .json(
                new ApiResponse(200, partner, "Delivery partners created successfully"),
            );
    },
);

const updateDeliveryPartner = asyncHandler(
    async (req: Request, res: Response) => {
        const { name, phone, vehicalType, isActive } = req.body;

        const partner = await adminService.updateDeliveryPartner(
            req.params.id as string,
            {
                name,
                phone,
                vehicalType,
                isActive,
            },
        );

        return res
            .status(200)
            .json(
                new ApiResponse(200, partner, "Delivery partners updated successfully"),
            );
    },
);

const assignDeliveryPartner = asyncHandler(
    async (req: Request, res: Response) => {
        const { partnerId } = req.body;

        const order = await adminService.assignDeliveryPartner(
            req.params.id as string,
            partnerId,
        );

        return res
            .status(200)
            .json(
                new ApiResponse(200, order, "Delivery partners assigned successfully"),
            );
    },
);

export const adminController = {
    getAdminStats,
    getDeliveryPartners,
    createDeliveryPartner,
    updateDeliveryPartner,
    assignDeliveryPartner
};
