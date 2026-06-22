import { RequestHandler } from "express";
import logger from "../monitoring/logger.js";
import { ApiError } from "../responses/ApiError.js";

export const asyncHandler = (fn: RequestHandler): RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch((error: unknown) => {
                if(error instanceof Error){
                    logger.error({
                        message: error.message,
                        stack: error.stack
                    })
                }

            const apiError = 
                error instanceof ApiError 
                ? error 
                : new ApiError(500, "Internal Server Error");
            
            next(apiError);
        })
    }
}
