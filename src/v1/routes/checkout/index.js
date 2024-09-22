"use strict";
const express = require("express");
const router = express.Router();
const checkoutController = require("../../controllers/checkout.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");

router.post(
    "/checkout-review",
    asyncHandler(checkoutController.checkkoutReview)
);

module.exports = router;
