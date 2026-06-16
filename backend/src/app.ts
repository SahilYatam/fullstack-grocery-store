import dotenv from "dotenv";
import cors from "cors";
import express, { Express, Request, Response, NextFunction } from "express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest";
import authRouter from "./routes/auth.routes";
import productRouter from "./routes/product.routes";
import uploadRouter from "./routes/upload.routes";
import orderRouter from "./routes/order.routes";
import addressRouter from "./routes/address.routes";
import adminRouter from "./routes/admin.routes";
import deliveryPartnerRouter from "./routes/deliveryPartner.routes";

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
