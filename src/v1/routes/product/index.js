"use strict";
const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const productController = require("../../controllers/product.controller");
const { authentication } = require("../../auth/authUtils");
//----------------------------------
router.get(
    "/search/:keySearch",
    asyncHandler(productController.searchProducts)
);
router.get("/findAll", asyncHandler(productController.findAllProducts));
router.get(
    "/findOne/:product_id",
    asyncHandler(productController.findOneProduct)
);
//authentication
router.use(authentication);
//---------------POST-------------------
router.post("/createProduct", asyncHandler(productController.createProduct));
router.patch(
    "/updateProduct/:productId",
    asyncHandler(productController.updateProduct)
);
router.post(
    "/publish/:id",
    asyncHandler(productController.publishProductByShop)
);
router.post(
    "/unpublish/:id",
    asyncHandler(productController.unpublishProductByShop)
);
//----------------GET------------------
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get(
    "/published/all",
    asyncHandler(productController.getAllPublishedForShop)
);

module.exports = router;
