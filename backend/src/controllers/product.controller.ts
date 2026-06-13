import { Request, Response } from "express";
import { productService } from "../services/product.service";
import { asyncHandler } from "../shared/handlers/asyncHandler";
import { ApiResponse } from "../shared/responses/ApiResponse";

const getDiscountDeals = asyncHandler(async (req: Request, res: Response) => {
    const discountProducts = await productService.getDiscountDeals();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                discountProducts,
                "Discount product fetched successfully",
            ),
        );
});

const getProducts = asyncHandler(async (req: Request, res: Response) => {
    const { category, search, minPrice, maxPrice, sort } = req.query;
    const products = await productService.getProducts(
        category?.toString(),
        search?.toString(),
        minPrice?.toString(),
        maxPrice?.toString(),
        sort?.toString(),
    );

    return res
        .status(200)
        .json(new ApiResponse(200, products, "Products fetched successfully"));
});

const getProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getProduct(req.params.id.toString());

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product fetched successfully"));
});

const createProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.createProduct({
        name: req.body.name,
        description: req.body.description,
        price: Number(req.body.price),
        originalPrice: req.body.originalPrice
            ? Number(req.body.originalPrice)
            : undefined,
        image: req.body.image,
        category: req.body.category,
        unit: req.body.unit,
        stock: req.body.stock ? Number(req.body.stock) : undefined,
        isOrganic: req.body.isOrganic,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, product, "Product created successfully"));
});

const updateProduct = asyncHandler(
    async (req: Request, res: Response) => {
        const product = await productService.updateProduct(
            req.params.id as string,
            {
                name: req.body.name,
                description: req.body.description,
                image: req.body.image,
                category: req.body.category,
                unit: req.body.unit,
                isOrganic: req.body.isOrganic,

                price:
                    req.body.price !== undefined
                        ? Number(req.body.price)
                        : undefined,

                originalPrice:
                    req.body.originalPrice !== undefined
                        ? Number(req.body.originalPrice)
                        : undefined,

                stock:
                    req.body.stock !== undefined
                        ? Number(req.body.stock)
                        : undefined,
            }
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                product,
                "Product updated successfully"
            )
        );
    }
);

const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    await productService.deleteProduct(req.params.id as string);

    return res.status(200).json(new ApiResponse(
        200,
        {},
        "Product deleted"
    ))
});

export const productController = {
    getDiscountDeals,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
};
