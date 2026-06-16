import { Router } from "express";
import { auth } from "../middlewares/auth";
import { admin } from "../middlewares/admin";
import { adminController } from "../controllers/admin.controller";

const adminRouter = Router();

adminRouter.get("/stats", auth, admin, adminController.getAdminStats);

adminRouter.get(
    "/delivery-partners",
    auth,
    admin,
    adminController.getDeliveryPartners,
);

adminRouter.post(
    "/delivery-partners",
    auth,
    admin,
    adminController.createDeliveryPartner,
);

adminRouter.put(
    "/delivery-partners/:id",
    auth,
    admin,
    adminController.updateDeliveryPartner,
);

adminRouter.put(
    "/orders/:id/assign",
    auth,
    admin,
    adminController.assignDeliveryPartner,
);

export default adminRouter;
