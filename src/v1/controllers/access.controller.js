"use strict";
const AccessService = require("../services/access.service");
const { CREATED, OK, SuccessResponse } = require("../core/success.response");
class AccessController {
    signUp = async (req, res, next) => {
        new CREATED({
            message: "Register successfully",
            metadata: await AccessService.signUp(req.body),
        }).send(res);
    };

    logIn = async (req, res, next) => {
        new SuccessResponse({
            message: "Login successfully",
            metadata: await AccessService.logIn(req.body),
        }).send(res);
    };

    logOut = async (req, res, next) => {
        try {
            new SuccessResponse({
                message: "Logout successfully",
                metadata: await AccessService.logOut(
                    req.keyStore,
                    req.accessToken
                ),
            }).send(res);
        } catch (error) {
            next(error);
        }
    };

    handleRefreshToken = async (req, res, next) => {
        new SuccessResponse({
            message: "Refresh token successfully",
            metadata: await AccessService.handleRefreshToken(
                req.body.refreshToken
            ),
        }).send(res);
    };
}

module.exports = AccessController;
