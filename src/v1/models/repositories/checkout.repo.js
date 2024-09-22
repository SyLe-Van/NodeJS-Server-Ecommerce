"use strict";

const { get } = require("lodash");
const { convertToObjectId } = require("../../utils");
const { cart } = require("../cart.model");
const { product } = require("../product.model");

const findCartById = async (cartId) => {
    return await cart
        .findOne({
            _id: convertToObjectId(cartId),
            cart_state: "active",
        })
        .lean();
};
const checkProductInCart = async (products) => {
    return await Promise.all(
        products.map(async (product) => {
            const foundProduct = await getProductById(product.productId);
            return {
                price: foundProduct.price,
                quantity: product.quantity,
                productId: product.productId,
            };
        })
    );
};
//----------------------------------
module.exports = {
    findCartById,
    checkProductInCart,
};
