"use strict";

/*
    Discount services
    1 - Generate a discount code [Shop]
    2 - Generate discount amount [User]
    3 - Get discount code [User]
    4 - Verify discount code [User]
    5 - Delete discount code [Shop]
    6 - Cancel discount code [User]
*/

const discount = require("../models/discount.model");
const { BadRequestError } = require("../core/error.response");
const { convertToObjectId } = require("../utils");
const { findAllProducts } = require("./product.service.v2");
const {
    findlAllDiscountCodeUnSelect,
    findAllDiscountCodeSelect,
    checkDiscountExists,
} = require("../models/repositories/discount.repo");
//----------------------------------
class DiscountService {
    static async createDiscountCode(payload) {
        const {
            name,
            description,
            type,
            value,
            code,
            start_date,
            end_date,
            shopId,
            isActive,
            min_order_value,
            max_value,
            product_ids,
            applies_to,
            max_uses,
            uses_count,
            users_used,
            max_uses_per_user,
        } = payload;
        // if (
        //     new Date() < new Date(start_date) ||
        //     new Date() > new Date(end_date)
        // ) {
        //     throw new BadRequestError("Discount code has not started yet");
        // }
        if (new Date(start_date) > new Date(end_date)) {
            throw new BadRequestError("Discount code must end after it starts");
        }
        //check discount code already exists
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shop_id: convertToObjectId(shopId),
        });
        if (foundDiscount && foundDiscount.discount_isActive) {
            throw new BadRequestError("Discount code already exists");
        }
        //create discount
        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_isActive: isActive,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === "all" ? ll : product_ids,
        });
        return newDiscount;
    }
    //Get all discount code available with product
    static async getAllDiscountCodesWithProduct({ code, shopId, limit, page }) {
        console.log("code:", code);
        console.log("shopId:", shopId);

        const foundDiscount = await discount
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectId(shopId),
            })
            .lean();
        console.log("foundDiscount:", foundDiscount);
        if (!foundDiscount || !foundDiscount.discount_isActive) {
            throw new BadRequestError("Discount code not found");
        }
        const { discount_product_ids, discount_applies_to } = foundDiscount;
        let products;
        if (discount_applies_to === "all") {
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectId(shopId),
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ["product_name", "product_price", "product_thumb"],
            });
        }
        if (discount_applies_to === "specific") {
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ["product_name", "product_price", "product_thumb"],
            });
        }
        return products;
    }
    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        const discounts = await findlAllDiscountCodeUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectId(shopId),
                discount_isActive: true,
            },
            unSelect: ["__v", "discount_shopId"],
            model: discount,
        });
        return discounts;
    }
    //apply discount code
    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectId(shopId),
            },
        });
        if (!foundDiscount) {
            throw new BadRequestError("Discount code not found");
        }
        const {
            discount_isActive,
            discount_max_uses,
            discount_min_order_value,
            discount_max_uses_per_user,
            discount_start_date,
            discount_end_date,
            discount_type,
            discount_value,
            discount_users_used,
        } = foundDiscount;
        if (!discount_isActive) {
            throw new BadRequestError("Discount expired");
        }
        if (!discount_max_uses) {
            throw new BadRequestError("Discount code has no limit");
        }
        // if (
        //     new Date() < new Date(discount_start_date) ||
        //     new Date() > new Date(discount_end_date)
        // ) {
        //     throw new BadRequestError("Discount expired");
        // }
        let totalOrder = 0;
        if (discount_min_order_value) {
            if (Array.isArray(products)) {
                totalOrder = products.reduce(
                    (total, product) =>
                        total + product.quantity * product.price,
                    0
                );
            } else if (typeof products === "object") {
                totalOrder = products.quantity * products.price;
            }

            if (totalOrder < discount_min_order_value) {
                throw new BadRequestError(
                    `Discount requires a minimum order value ${discount_min_order_value}`
                );
            }
        }
        if (discount_max_uses_per_user > 0) {
            const userUserDiscount = discount_users_used.find(
                (user) => user.userId === userId
            );
            if (userUserDiscount) {
                throw new BadRequestError(
                    "You have already used this discount code"
                );
            }
        }
        const amount =
            discount_type === "fixed_amount"
                ? Math.min(discount_value, totalOrder)
                : Math.min((totalOrder * discount_value) / 100, totalOrder);

        return {
            totalOrder,
            discount: amount,
            totalPrice: Math.max(totalOrder - amount, 0),
        };
    }
    static async deleteDiscountCode({ shopId, codeId }) {
        const deleteDiscount = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectId(shopId),
        });
        return deleteDiscount;
    }
    static async cancelDiscountCode({ shopId, codeId, userId }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectId(shopId),
            },
        });
        if (!foundDiscount) {
            throw new BadRequestError("Discount code not found");
        }
        const result = await discount.findOneAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: {
                    userId: userId,
                },
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1,
            },
        });
        return result;
    }
}
module.exports = DiscountService;
