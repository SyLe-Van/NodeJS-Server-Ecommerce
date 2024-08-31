"use strict";
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
    API_KEY: "x-api-key",
    CLIENT_ID: "x-client-id",
    AUTHORIZATION: "authorization",
};
const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await jwt.sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "2 days",
        });

        const refreshToken = await jwt.sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "7 days",
        });

        jwt.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.log("Error verifying token: ", err);
            } else {
                console.log("Token verified successfully");
            }
        });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error in createTokenPair:", error);
        return null;
    }
};

const authentication = asyncHandler(async (req, res, next) => {
    /*
    1 - Check userId missing?
    2 - Get accessToken
    3 - Verify accessToken
    4 - Check user in db
    5 - Check keyStore with userId
    6 - OK all => return next()
    */
    const userId = req.headers[HEADER.CLIENT_ID]?.toString();
    // 1 - Check userId missing?
    if (!userId) {
        throw new AuthFailureError("Invalid Request");
    }
    // 2 - Get accessToken
    const accessToken = req.headers[HEADER.AUTHORIZATION]?.toString();
    if (!accessToken) {
        throw new AuthFailureError("Invalid Request");
    }
    // 3 - Verify accessToken
    const keyStore = await findByUserId(userId);
    if (!keyStore) {
        throw new AuthFailureError("Not found keyStore");
    }

    try {
        const decodeUser = jwt.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId) {
            throw new AuthFailureError("Invalid userId");
        }
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
});

const verifyJWT = async (token, publicKey) => {
    return await jwt.verify(token, publicKey, { algorithms: ["RS256"] });
};

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
};
