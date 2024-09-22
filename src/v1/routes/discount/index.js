"use strict";
const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const discountController = require("../../controllers/discount.controller");
const { authentication } = require("../../auth/authUtils");

//---------------POST-------------------
router.post("/amount", asyncHandler(discountController.getDiscountAmount));
router.get(
    "/listProductByDiscountCode",
    asyncHandler(discountController.getAllDiscountCodesWithProducts)
);
//authentication
router.use(authentication);
//---------------POST-------------------
router.post(
    "/createDiscountCode",
    asyncHandler(discountController.createDiscountCode)
);
router.get(
    "/getListDiscountByShop",
    asyncHandler(discountController.getAllDiscountCodes)
);

module.exports = router;
