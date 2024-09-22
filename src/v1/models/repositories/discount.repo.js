"use strict";
const { unGetSelectData, getSelectData } = require("../../utils");
//----------------------------------
const findlAllDiscountCodeUnSelect = async ({
    limit = 50,
    page = 1,
    sort = "ctime",
    filter,
    unSelect,
    model,
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
    const products = await model
        .find(filter)
        .select(unGetSelectData(unSelect))
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean();
    return products;
};
const findAllDiscountCodeSelect = async ({
    limit = 50,
    page = 1,
    sort = "ctime",
    filter,
    unSelect,
    model,
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
    const products = await model
        .find(filter)
        .select(getSelectData(unSelect))
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean();
    return products;
};
const checkDiscountExists = async ({ model, filter }) => {
    return await model.findOne(filter).lean();
};
//----------------------------------
module.exports = {
    findlAllDiscountCodeUnSelect,
    findAllDiscountCodeSelect,
    checkDiscountExists,
};
