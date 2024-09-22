"use strict";
const AccessService = require("../services/access.service");
const { CREATED, OK, SuccessResponse } = require("../core/success.response");

class AccessController {
    static async signUp(req, res, next) {
        new CREATED({
            message: "Register successfully",
            metadata: await AccessService.signUp(req.body),
        }).send(res);
    }

    static async logIn(req, res, next) {
        new SuccessResponse({
            message: "Login successfully",
            metadata: await AccessService.logIn(req.body),
        }).send(res);
    }

    static async logOut(req, res, next) {
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
    }

    static async handleRefreshToken(req, res, next) {
        new SuccessResponse({
            message: "Get token successfully",
            metadata: await AccessService.handleRefreshToken({
                refreshToken: req.refreshToken,
                keyStore: req.keyStore,
                userId: req.user,
            }),
        }).send(res);
    }
}

module.exports = AccessController;
