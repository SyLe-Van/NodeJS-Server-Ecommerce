"use strict";

const { update } = require("lodash");
const cart = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");
class CartService {
    //repo cart
    static async createUserCart({ userId, product = {} }) {
        const query = { cart_userId: userId, cart_state: "active" },
            updateOrInsert = {
                $addToSet: {
                    cart_products: product,
                },
            },
            options = {
                upsert: true,
                new: true,
            };
        return await cart.findOneAndUpdate(query, updateOrInsert, options);
    }

    //update cart
    static async updateUserCartQuantity({ userId, product = {} }) {
        const { productId, quantity } = product;
        const query = {
            cart_userId: userId,
            cart_state: "active",
            "cart_products.product_id": productId,
        };
        const updateSet = { $set: { "cart_products.$.quantity": quantity } };

        const updatedCart = await cart.updateOne(query, updateSet);

        if (updatedCart.nModified === 0) {
            throw new Error(
                "Product not found in cart or quantity not updated"
            );
        }

        const updatedCartData = await cart.findOne({
            cart_userId: userId,
            cart_state: "active",
        });

        return updatedCartData;
    }

    //end repo cart
    static async addToCart({ userId, product = {} }) {
        //check cart
        const userCart = await cart.findOne({ cart_userId: userId });
        if (!userCart) {
            return await CartService.createUserCart({ userId, product });
        }
        if (userCart.cart_products.length === 0) {
            userCart.cart_products = [product];
            return await userCart.save();
        }
        //update quantity
        return await CartService.updateUserCartQuantity({ userId, product });
    }

    static async addToCartV2({ userId, shop_order_ids }) {
        const { productId, quantity, old_quantity } =
            shop_order_ids[0]?.item_products[0];
        const foundProduct = await getProductById(productId);

        if (!foundProduct) {
            throw new Error("Product not found");
        }

        if (foundProduct.product_shop.toString() !== shop_order_ids[0].shopId) {
            throw new Error("Product not found");
        }
        if (quantity === 0) {
            return await CartService.deleteUserCart({ userId, productId });
        }
        return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity,
            },
        });
    }
    //delete cart
    static async deleteUserCart({ userId, productId }) {
        const query = { cart_userId: userId, cart_state: "active" },
            updateSet = { $pull: { cart_products: { productId } } };
        const deleteCart = await cart.updateOne(query, updateSet);
        return deleteCart;
    }
    static async getListUserCart({ userId }) {
        return await cart.findOne({ cart_userId: +userId }).lean();
    }
}

module.exports = CartService;
