"use strict";

const CartService = require("../services/cart.service");
const { SuccessResponse } = require("../core/success.response");

class CarController {
    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: "Add product to cart successfully",
            metadata: await CartService.addToCart(req.body),
        }).send(res);
    };
    update = async (req, res, next) => {
        new SuccessResponse({
            message: "Update product in cart successfully",
            metadata: await CartService.addToCartV2(req.body),
        }).send(res);
    };
    delete = async (req, res, next) => {
        new SuccessResponse({
            message: "Delete product in cart successfully",
            metadata: await CartService.deleteUserCart(req.body),
        }).send(res);
    };
    listToCart = async (req, res, next) => {
        new SuccessResponse({
            message: "Get List product in cart successfully",
            metadata: await CartService.getListUserCart(req.query),
        }).send(res);
    };
}
module.exports = new CarController();
