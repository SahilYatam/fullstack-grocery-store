import { Request, Response, NextFunction } from "express";
import { ApiError } from "../shared/responses/ApiError.js";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import logger from "../shared/monitoring/logger.js";

export const deliveryAuth = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "No token provided");
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: string;
            role: string;
        };

        if (decoded.role !== "delivery") {
            throw new ApiError(403, "Access denied. Delivery partner only.");
        }

        const partner = await prisma.deliveryPartner.findUnique({
            where: { id: decoded.id },
        });

        if (!partner || !partner.isActive) {
            throw new ApiError(403, "Account is deactivated");
        }

        req.partner = partner;
        next();
    } catch (error) {
        logger.error(error);
        throw new ApiError(401, "Token is not valid");
    }
};
