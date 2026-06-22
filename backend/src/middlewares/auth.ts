import { Request, Response, NextFunction } from "express"
import { ApiError } from "../shared/responses/ApiError.js";
import jwt from "jsonwebtoken";
import logger from "../shared/monitoring/logger.js";

export const auth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            throw new ApiError(401, "No token provided, authorization denied");
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {id: string}

        req.user = {id: decoded.id}

        next()
    } catch (error) {
        logger.error(error)
        throw new ApiError(401, "Token is not valid")
    }
}

