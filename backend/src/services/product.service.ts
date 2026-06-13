import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../shared/responses/ApiError";

const getDiscountDeals = async () => {
    const products = await prisma.product.findMany({
        where: { stock: { gt: 0 } },
        orderBy: { originalPrice: "desc" },
    });

    return products
        .map((p) => ({
            ...p,
            discount:
                p.originalPrice && p.originalPrice > p.price
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    : 0,
        }))
        .filter((p) => p.discount > 0);
};

const getProducts = async (
    category?: string,
    search?: string,
    minPrice?: string,
    maxPrice?: string,
    sort?: string,
) => {
    const where: Prisma.ProductWhereInput = {
        stock: {
            gt: 0,
        },
    };

    if (category && category !== "all") {
        where.category = category;
    }

    if (search?.trim()) {
        where.name = {
            contains: search.trim(),
            mode: "insensitive",
        };
    }

    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;

    if (
        (min !== undefined && !Number.isNaN(min)) ||
        (max !== undefined && !Number.isNaN(max))
    ) {
        where.price = {};

        if (min !== undefined && !Number.isNaN(min)) {
            where.price.gte = min;
        }

        if (max !== undefined && !Number.isNaN(max)) {
            where.price.lte = max;
        }
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
        sort === "price-low"
            ? { price: "asc" }
            : sort === "price-high"
              ? { price: "desc" }
              : { createdAt: "desc" };

    const products = await prisma.product.findMany({
        where,
        orderBy,
    });

    return products.map((product) => ({
        ...product,
        discount:
            product.originalPrice &&
            product.originalPrice > product.price
                ? Math.round(
                      ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                  )
                : 0,
    }));
};

const getProduct = async(id: string) => {
    const product = await prisma.product.findUnique({
        where: {id}
    })

    if(!product) throw new ApiError(404, "Product not found");

    const discount = product.originalPrice && product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    return {...product, discount}
}

type CreateProductInput = {
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    unit?: string;
    stock?: number;
    isOrganic?: boolean;
};

const createProduct = async (data: CreateProductInput) => {
    const {
        name,
        description,
        price,
        originalPrice,
        image,
        category,
        unit,
        stock,
        isOrganic,
    } = data;

    if (!name?.trim()) {
        throw new ApiError(400, "Product name is required");
    }

    if (!image?.trim()) {
        throw new ApiError(400, "Product image is required");
    }

    if (!category?.trim()) {
        throw new ApiError(400, "Product category is required");
    }

    if (price <= 0) {
        throw new ApiError(400, "Price must be greater than 0");
    }

    if (
        originalPrice &&
        originalPrice > 0 &&
        originalPrice < price
    ) {
        throw new ApiError(
            400,
            "Original price cannot be less than selling price"
        );
    }

    const product = await prisma.product.create({
        data: {
            name: name.trim(),
            description: description?.trim(),
            price,
            originalPrice,
            image: image.trim(),
            category: category.trim(),
            unit,
            stock,
            isOrganic,
        },
    });

    return product;
};

type UpdateProductInput = {
    name?: string;
    description?: string;
    price?: number;
    originalPrice?: number;
    image?: string;
    category?: string;
    unit?: string;
    stock?: number;
    isOrganic?: boolean;
};

const updateProduct = async(id: string, data: UpdateProductInput) => {
    const existingProduct = await prisma.product.findUnique({
        where: {id}
    })

    if(!existingProduct) throw new ApiError(404, "Product not found");

    const updatedPrice = data.price ?? existingProduct.price;
    const updatedOriginalPrice = data.originalPrice ?? existingProduct.originalPrice;

    if(
        updatedOriginalPrice && 
        updatedOriginalPrice > 0 &&
        updatedOriginalPrice < updatedPrice
    ) {
        throw new ApiError(
            400,
            "Original price cannot be less than selling price"
        );
    }

    const product = await prisma.product.update({
        where: {id},
        data : {
            ...(data.name !== undefined && {
                name: data.name.trim(),
            }),

            ...(data.description !== undefined && {
                description: data.description.trim(),
            }),

            ...(data.image !== undefined && {
                image: data.image.trim(),
            }),

            ...(data.category !== undefined && {
                category: data.category.trim(),
            }),

            ...(data.price !== undefined && {
                price: data.price,
            }),

            ...(data.originalPrice !== undefined && {
                originalPrice: data.originalPrice,
            }),

            ...(data.unit !== undefined && {
                unit: data.unit,
            }),

            ...(data.stock !== undefined && {
                stock: data.stock,
            }),

            ...(data.isOrganic !== undefined && {
                isOrganic: data.isOrganic,
            }),
        }
    })
    return product
}

const deleteProduct = async(id: string) => {
    try {
        await prisma.product.delete({where:{id}})
    } catch (error) {
        if(
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            throw new ApiError(404, "Product not found");
        }
        throw error
    }
}

export const productService = {
    getDiscountDeals,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
};
