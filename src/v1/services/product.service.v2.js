"use strict";

const {
    product,
    clothing,
    electronic,
    furniture,
    inventory,
} = require("../models/product.model");
const { BadRequestError, ForbiddenError } = require("../core/error.response");
const {
    findAllDraftsForShop,
    publishProductByShop,
    findAllPublishedForShop,
    unpublishProductByShop,
    searchProductsByUser,
    findAllProducts,
    findOneProduct,
    updateProductById,
} = require("../models/repositories/product.repo");
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils");
const { insertInventory } = require("../models/repositories/inventory.repo");
const { model } = require("mongoose");
// define Factory class
class ProductFactory {
    static productRegistry = {};
    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef;
    }
    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) {
            throw new BadRequestError(`Invalid Product Types ${type}`);
        }
        return new productClass(payload).createProduct();
    }

    static async updateProduct(type, productId, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) {
            throw new BadRequestError(`Invalid Product Types ${type}`);
        }
        return new productClass(payload).updateProduct(productId);
    }
    //PUT
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id });
    }
    static async unpublishProductByShop({ product_shop, product_id }) {
        return await unpublishProductByShop({ product_shop, product_id });
    }
    //query
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true };
        return await findAllDraftsForShop({ query, limit, skip });
    }
    static async findAllPublishedForShop({
        product_shop,
        limit = 50,
        skip = 0,
    }) {
        const query = { product_shop, isPublished: true };
        return await findAllPublishedForShop({ query, limit, skip });
    }
    static async searchProducts({ keySearch }) {
        return await searchProductsByUser({ keySearch });
    }
    static async findAllProducts({
        limit = 50,
        sort = "ctime",
        page = 1,
        filter = { isPublished: true },
        select = [
            "product_name",
            "product_price",
            "product_thumb",
            "product_shop",
        ],
    }) {
        return await findAllProducts({ limit, sort, page, filter, select });
    }
    static async findOneProduct({ product_id }) {
        return await findOneProduct({
            product_id,
            unSelect: ["product_variation", "__v"],
        });
    }

    //end query
}
//----------------------------------------------------------------------------------
// define base product class
class Product {
    constructor({
        product_name,
        product_price,
        product_type,
        product_shop,
        product_attributes,
        product_description,
        product_thumb,
        product_quantity,
    }) {
        this.product_name = product_name;
        this.product_price = product_price;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
        this.product_description = product_description;
        this.product_thumb = product_thumb;
        this.product_quantity = product_quantity;
    }
    //create product
    async createProduct(product_id) {
        const newProduct = await product.create({ ...this, _id: product_id });
        if (newProduct) {
            const inventory = await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity,
                location: "unknown",
            });
            console.log("Inventory created");
        }
        return newProduct;
    }
    //update product
    async updateProduct(productId, bodyUpdate) {
        return await updateProductById({
            productId,
            bodyUpdate,
            model: product,
        });
    }
}

//define sub class for different product types
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create(this.product_attributes);
        if (!newClothing) throw new BadRequestError(`Invalid Product`);

        const newProduct = await super.createProduct(newClothing._id);
        if (!newProduct) throw new BadRequestError(`Invalid Product`);

        return newProduct;
    }

    async updateProduct(productId) {
        const objectParams = removeUndefinedObject(this);
        if (objectParams.product_attributes) {
            await updateProductById({
                productId,
                bodyUpdate: updateNestedObjectParser(
                    objectParams.product_attributes
                ),
                model: clothing,
            });
        }

        // Fetch the updated product
        const updateProduct = await super.updateProduct(
            productId,
            updateNestedObjectParser(objectParams)
        );

        return updateProduct;
    }
}

class Electronic extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newElectronic) throw new BadRequestError(`Invalid Product`);

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct) throw new BadRequestError(`Invalid Product`);
        return newProduct;
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newFurniture) throw new BadRequestError(`Invalid Product`);

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct) throw new BadRequestError(`Invalid Product`);
        return newProduct;
    }
}

//register product type
ProductFactory.registerProductType("Electronics", Electronic);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
