import { Router } from "express";
import { auth } from "../middlewares/auth";
import { orderController } from "../controllers/order.controller";
import { admin } from "../middlewares/admin";

const orderRouter = Router();

orderRouter.post("/", auth, orderController.createOrder);
orderRouter.get("/", auth, orderController.getUserOrders);
orderRouter.get("/all", auth, admin, orderController.getAllOrders);
orderRouter.get("/:id", auth, orderController.getOrder);
orderRouter.put("/:id/status", auth, admin, orderController.updateOrderStatus);
orderRouter.get("/:id/location", auth, orderController.getOrderLocation);

export default orderRouter;
