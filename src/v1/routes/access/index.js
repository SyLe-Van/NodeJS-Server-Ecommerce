"use strict";
const express = require("express");
const router = express.Router();
const AccessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const accessController = new AccessController();
const { authentication } = require("../../auth/authUtils");
//sign up
router.post("/shop/signup", asyncHandler(accessController.signUp));
router.post("/shop/login", asyncHandler(accessController.logIn));
//authentication
router.use(authentication);
//logout
router.post("/shop/logout", asyncHandler(accessController.logOut));
router.post(
    "/shop/handleRefreshToken",
    asyncHandler(accessController.handleRefreshToken)
);

module.exports = router;
