import { Router } from "express";
import { addressController } from "../controllers/address.controller";
import { auth } from "../middlewares/auth";

const addressRouter = Router();

addressRouter.get("/", auth, addressController.getAddresses);
addressRouter.post("/", auth, addressController.addAddress);
addressRouter.put("/:id", auth, addressController.updateAddress);
addressRouter.delete("/:id", auth, addressController.deleteAddress);

export default addressRouter;