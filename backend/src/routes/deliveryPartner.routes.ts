import { Router } from "express";
import { deliveryPartnerController } from "../controllers/deliveryPartner.controller.js";
import { deliveryAuth } from "../middlewares/deliveryAuth.js";

const deliveryPartnerRouter = Router();

deliveryPartnerRouter.post("/login", deliveryPartnerController.loginPartner);

deliveryPartnerRouter.get(
    "/my-deliveries",
    deliveryAuth,
    deliveryPartnerController.getMyDeliveries,
);

deliveryPartnerRouter.get(
    "/my-deliveries/:id",
    deliveryAuth,
    deliveryPartnerController.getDeliveryDetail,
);

deliveryPartnerRouter.put(
    "/my-deliveries/:id/complete",
    deliveryAuth,
    deliveryPartnerController.completeDelivery,
);

deliveryPartnerRouter.put(
    "/my-deliveries/:id/cancel",
    deliveryAuth,
    deliveryPartnerController.cancelDelivery,
);

deliveryPartnerRouter.put(
    "/my-deliveries/:id/status",
    deliveryAuth,
    deliveryPartnerController.updateDeliveryStatus,
);

deliveryPartnerRouter.put(
    "/my-deliveries/:id/location",
    deliveryAuth,
    deliveryPartnerController.updateLiveLocation,
);

export default deliveryPartnerRouter;
