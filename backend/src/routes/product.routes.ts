import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { auth } from "../middlewares/auth";
import { admin } from "../middlewares/admin";

const productRouter = Router();

productRouter.get("/discount-deals", productController.getDiscountDeals)
productRouter.get("/", productController.getProducts)
productRouter.get("/:id", productController.getProduct)
productRouter.post("/", auth, admin, productController.createProduct)
productRouter.patch("/:id", auth, admin, productController.updateProduct)
productRouter.delete("/:id", auth, admin, productController.deleteProduct)

export default productRouter;