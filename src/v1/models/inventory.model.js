"use strict";
const { model, Schema, type } = require("mongoose");
const { collection } = require("./shop.model");
const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

const inventorySchema = new Schema(
    {
        product_id: {
            type: Schema.Types.ObjectId,
            ref: "Product",
        },
        shop_id: {
            type: Schema.Types.ObjectId,
            ref: "Shop",
        },
        location: {
            type: String,
            default: "unknown",
        },
        stock: {
            type: Number,
            default: 0,
        },
        reservations: {
            type: Array,
            default: [],
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

module.exports = model(DOCUMENT_NAME, inventorySchema);
