import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import multer from "multer";
import { ApiError } from "../shared/responses/ApiError.js";
import cloudinary from "../config/cloudinary.js";

const uploadRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

uploadRouter.post("/", auth, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            throw new ApiError(400, "No image file provided");
        }

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURL = "data:" + req.file.mimetype + ";base64," + b64;

        const result = await cloudinary.uploader.upload(dataURL, {
            folder: "grocery-del",
            resource_type: "auto",
        });

        res.json({ url: result.secure_url });
    } catch (error: any) {
        console.error("Upload Error:", error);

        throw new ApiError(500, error?.message || "Failed to upload image");
    }
});

export default uploadRouter;
