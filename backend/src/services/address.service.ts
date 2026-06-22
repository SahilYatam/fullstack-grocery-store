import { prisma } from "../config/prisma.js";
import logger from "../shared/monitoring/logger.js";
import { ApiError } from "../shared/responses/ApiError.js";

// Get user address
const getAddresses = async (userId: string) => {
    const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
    });

    return addresses;
};

// Add address
type AddressDetails = {
    label: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    isDefault: boolean;
    lat: number;
    lng: number;
};
const addAddress = async (userId: string, address: AddressDetails) => {
    if (address.lat === null || address.lng === null) {
        throw new ApiError(
            400,
            "Location coordinates are required. Please allow location access.",
        );
    }

    const currentAddress = await prisma.address.findMany({
        where: { userId },
    });

    let makeDefault = address.isDefault;
    if (currentAddress.length === 0) makeDefault = true;

    if (makeDefault) {
        await prisma.address.updateMany({
            where: { userId },
            data: { isDefault: false },
        });
    }

    await prisma.address.create({
        data: {
            userId,
            label: address.label,
            address: address.address,
            city: address.city,
            state: address.state,
            zip: address.zip,
            isDefault: makeDefault,
            lat: address.lat,
            lng: address.lng,
        },
    });

    const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
    });

    return addresses;
};


type UpdateAddress = {
    label: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    isDefault: boolean;
    lat: number;
    lng: number;
};
const updateAddress = async(id: string, userId: string, addressData: UpdateAddress) => {
    if (addressData.lat === null || addressData.lng === null) {
        throw new ApiError(
            400,
            "Location coordinates are required. Please allow location access.",
        );
    }

    if(addressData.isDefault){
        await prisma.address.updateMany({
            where: {userId},
            data: {isDefault: false}
        })
    }

    const data: any= {}
    if(addressData.label) data.label = addressData.label;
    if(addressData.address) data.address = addressData.address;
    if(addressData.city) data.city = addressData.city;
    if(addressData.state) data.state = addressData.state;
    if(addressData.zip) data.zip = addressData.zip;
    if(addressData.isDefault !== undefined) data.isDefault = addressData.isDefault;
    if(addressData.lat !== null) data.lat = Number(addressData.lat);
    if(addressData.lng !== null) data.lng = Number(addressData.lng);

    try{
        await prisma.address.update({
            where: {id},
            data
        })
    } catch {
        throw new ApiError(404, "Address not found")
    }

    const addresses = await prisma.address.findMany({
        where: {userId},
        orderBy: {createdAt: "asc"}
    })

    return addresses
}

const deleteAddress = async(id: string, userId: string) => {
    try {
        await prisma.address.delete({
            where: {id}
        })
    } catch(error: any){
        logger.error("error while deleting address",error.message)
    }
  
    
    const addresses = await prisma.address.findMany({
        where: {userId},
        orderBy: {createdAt: "asc"}
    })

    return addresses
}

export const addressService = {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress
};
