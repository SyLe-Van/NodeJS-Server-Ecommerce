"use strict";

const {
    findCartById,
    checkProductInCart,
} = require("../models/repositories/checkout.repo");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { product } = require("../models/product.model");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock } = require("./redis.service");

class CheckoutService {
    /**
        {
            "cartId": "string",
            "userId": "string",
            "shop_order_ids": [
                {
                    shopId,
                    shop_discounts,
                    item_product: [
                        {
                            price,
                            quantity,
                            product_id,
                            product_name,
                        }
                    ]

                },
                 {
                    shopId,
                    shop_discounts: [
                        {
                            discount_id,
                            shop_id,
                            codeId,

                        }
                    ],
                    item_product: [
                        {
                            price,
                            quantity,
                            product_id,
                            product_name,
                        }
                    ]

                }
            ]
        }
     */
    static async checkoutReview({ cartId, userId, shop_order_ids }) {
        const foundCart = await findCartById(cartId);
        if (!foundCart) {
            throw new NotFoundError("Cart not found");
        }
        const checkout_order = {
                totalPrice: 0,
                feeShip: 0,
                totalDiscount: 0,
                totalCheckout: 0,
            },
            shop_order_ids_new = [];
        for (let i = 0; i < shop_order_ids.length; i++) {
            const {
                shopId,
                shop_discounts = [],
                item_products = [],
            } = shop_order_ids[i];
            // check product available in cart
            const checkProduct = await checkProductInCart(item_products);
            if (!checkProduct[0])
                throw new BadRequestError("Product not found in cart");
            const checkoutPrice = checkProduct.reduce((acc, product) => {
                return acc + product.price * product.quantity;
            }, 0);

            // tong tien truoc khi xu li
            checkout_order.totalPrice += checkoutPrice;
            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, //time truoc khi giam gia
                priceApplyDiscount: checkoutPrice, //tong tien sau khi giam gia
                item_products: checkProduct,
            };
            if (shop_discounts.length > 0) {
                //chi co 1 discount
                const { totalPrice = 0, discount = 0 } =
                    await getDiscountAmount({
                        codeId: shop_discounts[0].codeId,
                        userId,
                        shopId,
                        products: checkProduct,
                    });
                //tong discount giam gia
                checkout_order.totalDiscount += discount;
                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount;
                }
                //tong thanh toan cuoi cung
                checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
                shop_order_ids_new.push(itemCheckout);
            }
        }
        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order,
        };
    }
    //order
    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {},
    }) {
        const { shop_order_ids_new, checkout_order } =
            await CheckoutService.checkoutReview({
                cartId,
                userId,
                shop_order_ids,
            });
        //check inventory
        const products = shop_order_ids_new.flatMap(
            (order) => order.item_products
        );
        console.log(products);
        const acquireProduct = [];
        for (let i = 0; i < products.length; i++) {
            const { product_id, quantity } = products[i];
            const keyLock = await acquireLock(product_id, quantity, cartId);
            acquireProduct.push(keyLock ? true : false);
        }
    }
}

module.exports = CheckoutService;
