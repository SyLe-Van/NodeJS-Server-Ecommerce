"use strict";

const {
    clothing,
    electronic,
    furniture,
    product,
} = require("../../models/product.model");
const { Types } = require("mongoose");
const { convertToObjectId } = require("../../utils");

//-------------------------------------------------------------------
const queryProduct = async ({ query, limit, skip }) => {
    return await product
        .find(query)
        .populate("product_shop", "name email -_id")
        .sort({ updateAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
};
const findAllDraftsForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip });
};
const findAllPublishedForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip });
};
const updateProductById = async ({
    productId,
    bodyUpdate,
    model,
    isNew = true,
}) => {
    return await model.findByIdAndUpdate(productId, bodyUpdate, {
        new: isNew,
    });
};
const searchProductsByUser = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch);
    return await product
        .find(
            { isPublished: true, $text: { $search: regexSearch } },
            { score: { $meta: "textScore" } }
        )
        .sort({ score: { $meta: "textScore" } })
        .lean();
};
const publishProductByShop = async ({ product_shop, product_id }) => {
    return await product.findOneAndUpdate(
        { _id: product_id, product_shop: product_shop },
        { $set: { isDraft: false, isPublished: true } },
        { new: true }
    );
};
const unpublishProductByShop = async ({ product_shop, product_id }) => {
    return await product.findOneAndUpdate(
        { _id: product_id, product_shop: product_shop },
        { $set: { isDraft: true, isPublished: false } },
        { new: true }
    );
};
const findAllProducts = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
    const selectFields = select.join(" ");
    return await product
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(selectFields)
        .lean();
};
const findOneProduct = async ({ product_id, unSelect }) => {
    return await product
        .findById(product_id)
        .select(unSelect.map((el) => `-${el}`).join(" "))
        .lean();
};
const getProductById = async (productId) => {
    return await product.findOne({ _id: convertToObjectId(productId) });
};
//----------------------------------------------------------
module.exports = {
    findAllDraftsForShop,
    publishProductByShop,
    findAllPublishedForShop,
    unpublishProductByShop,
    searchProductsByUser,
    findAllProducts,
    findOneProduct,
    updateProductById,
    getProductById,
};
