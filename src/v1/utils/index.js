"use strict";
const _ = require("lodash");
const { Types } = require("mongoose");
//----------------------------------
const convertToObjectId = (id) => {
    return Types.ObjectId(id);
};

const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields);
};
const removeUndefinedObject = (obj) => {
    Object.keys(obj).forEach((key) => {
        if (obj[key] === null || obj[key] === undefined) {
            delete obj[key];
        }
    });
    return obj;
};
const unGetSelectData = (select = []) => {
    return select.map((el) => `-${el}`);
};
const getSelectData = (select = []) => {
    return select.join(" ");
};
const updateNestedObjectParser = (obj) => {
    const final = {};
    Object.keys(obj).forEach((k) => {
        if (typeof obj[k] === "object" && !Array.isArray(obj[k])) {
            const response = updateNestedObjectParser(obj[k]);
            Object.keys(response).forEach((a) => {
                final[`${k}.${a}`] = response[a];
            });
        } else {
            final[k] = obj[k];
        }
    });
    return final;
};

module.exports = {
    getInfoData,
    removeUndefinedObject,
    updateNestedObjectParser,
    convertToObjectId,
    getSelectData,
    unGetSelectData,
};
