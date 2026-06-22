import dotenv from "dotenv";
import cors from "cors";
import express, { Express, Request, Response, NextFunction } from "express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import authRouter from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import orderRouter from "./routes/order.routes.js";
import addressRouter from "./routes/address.routes.js";
import adminRouter from "./routes/admin.routes.js";
import deliveryPartnerRouter from "./routes/deliveryPartner.routes.js";

dotenv.config();

let app: Express | null = null;

app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.send({ Status: "OK" });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/orders", orderRouter);
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/addresses", addressRouter);
app.use("/api/admin", adminRouter);
app.use("/api/delivery", deliveryPartnerRouter);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    res.status(500).json({ message: error.message });
});

export { app };
