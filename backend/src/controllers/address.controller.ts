import { Request, Response } from "express";
import { addressService } from "../services/address.service";
import { asyncHandler } from "../shared/handlers/asyncHandler";
import { ApiResponse } from "../shared/responses/ApiResponse";

const getAddresses = asyncHandler(async (req: Request, res: Response) => {
    const addresses = await addressService.getAddresses(req.user?.id as string);

    return res
        .status(200)
        .json(new ApiResponse(200, addresses, "User address fetched"));
});

const addAddress = asyncHandler(async (req: Request, res: Response) => {
    const { label, address, city, state, zip, isDefault, lat, lng } = req.body;

    const addresses = await addressService.addAddress(req.user?.id as string, {
        label,
        address,
        city,
        state,
        zip,
        isDefault,
        lat,
        lng,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, addresses, "Address added successfully"));
});

const updateAddress = asyncHandler(async (req: Request, res: Response) => {
    const { label, address, city, state, zip, isDefault, lat, lng } = req.body;

    const addresses = await addressService.updateAddress(
        req.params.id as string,
        req.user?.id as string,
        { label, address, city, state, zip, isDefault, lat, lng },
    );

    return res
        .status(200)
        .json(new ApiResponse(200, addresses, "Address updated successfully"));
});

const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
    await addressService.deleteAddress(
        req.params.id as string,
        req.user?.id as string,
    );

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Address deleted successfully"));
});

export const addressController = {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress
};
