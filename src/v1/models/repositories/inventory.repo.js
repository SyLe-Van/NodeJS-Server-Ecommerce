"use strict";
const { convertToObjectId } = require("../../utils");
const inventory = require("../inventory.model");
const { Types } = require("mongoose");
//---------------------------------
const insertInventory = async ({
    productId,
    shopId,
    stock,
    location = "unknown",
}) => {
    return await inventory.create({
        product_id: productId,
        shop_id: shopId,
        stock: stock,
        location: location,
    });
};

const reservationInventory = async ({ productId, cartId, quantity }) => {
    const query = {
            inven_productId: convertToObjectId(productId),
            inven_stock: { $gte: quantity },
        },
        updateSet = {
            $inc: { inven_stock: -quantity },
            $push: {
                inven_reservations: { quantity, cartId, createOn: new Date() },
            },
        },
        options = { new: true, upsert: true };
    return await inventory.updateOne(query, updateSet, options);
};
//---------------------------------
module.exports = {
    insertInventory,
    reservationInventory,
};
