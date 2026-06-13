import { Request, Response, NextFunction } from "express"
import { ApiError } from "../shared/responses/ApiError";
import logger from "../shared/monitoring/logger";
import { prisma } from "../config/prisma";

export const admin = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if(!userId) throw new ApiError(401, "Unauthorized");

        const user = await prisma.user.findUnique({
            where: {id: userId}
        })
        if(!user) throw new ApiError(404, "User not found");

        const adminEmails = process.env.ADMIN_EMAILS ?  process.env.ADMIN_EMAILS.split("m").map((e) => e.trim().toLowerCase()) : [];

        if(adminEmails.includes(user.email.toLowerCase())){
            if(req.user) req.user.isAdmin = true;
            next()
        } else {
            throw new ApiError(403, "Admin access required")
        }

    } catch (error) {
        logger.error(error)
        throw new ApiError(500, "Admin verification failed")
    }
}

