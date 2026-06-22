import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { orderController } from "../controllers/order.controller.js";
import { admin } from "../middlewares/admin.js";

const orderRouter = Router();

orderRouter.post("/", auth, orderController.createOrder);

orderRouter.get("/:status", auth, orderController.getUserOrders);

orderRouter.get("/all", auth, admin, orderController.getAllOrders);

orderRouter.get("/:id", auth, orderController.getOrder);

orderRouter.put("/:id/status", auth, admin, orderController.updateOrderStatus);

orderRouter.get("/:id/location", auth, orderController.getOrderLocation);

export default orderRouter;
