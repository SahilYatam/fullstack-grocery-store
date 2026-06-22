import { Router } from "express";
import { productController } from "../controllers/product.controller.js";
import { auth } from "../middlewares/auth.js";
import { admin } from "../middlewares/admin.js";

const productRouter = Router();

productRouter.get("/discount-deals", productController.getDiscountDeals);
productRouter.get("/", productController.getProducts);
productRouter.get("/admin", productController.getAdminProducts);
productRouter.get("/:id", productController.getProduct);
productRouter.post("/", auth, admin, productController.createProduct);
productRouter.put("/:id", auth, admin, productController.updateProduct);
productRouter.put(
    "/out-of-stock/:id",
    auth,
    admin,
    productController.deleteStockProduct,
);

export default productRouter;
