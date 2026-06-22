import { Router } from "express";
import { addressController } from "../controllers/address.controller.js";
import { auth } from "../middlewares/auth.js";

const addressRouter = Router();

addressRouter.get("/", auth, addressController.getAddresses);
addressRouter.post("/", auth, addressController.addAddress);
addressRouter.put("/:id", auth, addressController.updateAddress);
addressRouter.delete("/:id", auth, addressController.deleteAddress);

export default addressRouter;