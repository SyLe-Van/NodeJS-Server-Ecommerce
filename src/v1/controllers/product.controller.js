"use strict";
const { SuccessResponse } = require("../core/success.response");
const ProductServiceV2 = require("../services/product.service.v2");

class ProductController {
    //create product
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Create product successfully",
            metadata: await ProductServiceV2.createProduct(
                req.body.product_type,
                {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res);
    };
    //update product
    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Update product successfully",
            metadata: await ProductServiceV2.updateProduct(
                req.body.product_type,
                req.params.productId,
                {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res);
    };
    //publish product
    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Publish product successfully",
            metadata: await ProductServiceV2.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id,
            }),
        }).send(res);
    };
    unpublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Unpublish product successfully",
            metadata: await ProductServiceV2.unpublishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id,
            }),
        }).send(res);
    };
    /*
     * @desc Get all drafts for shop
     * @param {Number} limit
     * @param {Number} skip
     * @return {JSON}
     */
    //query
    //get all drafts for shop
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all drafts for shop successfully",
            metadata: await ProductServiceV2.findAllDraftsForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };
    //get all published for shop
    getAllPublishedForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all published for shop successfully",
            metadata: await ProductServiceV2.findAllPublishedForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };
    //search products
    searchProducts = async (req, res, next) => {
        new SuccessResponse({
            message: "Search products successfully",
            metadata: await ProductServiceV2.searchProducts(req.params),
        }).send(res);
    };

    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: "Find all products successfully",
            metadata: await ProductServiceV2.findAllProducts(req.query),
        }).send(res);
    };
    //find one product
    findOneProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Find one product successfully",
            metadata: await ProductServiceV2.findOneProduct({
                product_id: req.params.product_id,
            }),
        }).send(res);
    };
    //end query
}

module.exports = new ProductController();
