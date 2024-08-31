"use strict";
const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const getInfoData = require("../utils");
const {
    BadRequestError,
    ForbiddenError,
    AuthFailureError,
} = require("../core/error.response");
const JWT = require("jsonwebtoken");

const { findByEmail } = require("./shop.service");
const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};
class AccessService {
    static handleRefreshToken = async (refreshToken) => {
        console.log("Attempting to handle refresh token:", refreshToken);

        const foundToken = await KeyTokenService.findByRefreshTokenUsed(
            refreshToken
        );
        console.log("Found used token:", foundToken);
        if (foundToken) {
            await KeyTokenService.deleteKeyById(foundToken.user);
            throw new ForbiddenError(
                "Something wrong happened! Please relogin"
            );
        }

        const holderToken = await KeyTokenService.findByRefreshToken(
            refreshToken
        );
        console.log("Found holder token:", holderToken);
        if (!holderToken) throw new AuthFailureError("Shop not registered");

        const { userId, email } = await verifyJWT(
            refreshToken,
            holderToken.publicKey
        );
        console.log("Decoded token:", { userId, email });
        console.log("Public key used:", holderToken.publicKey);

        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError("Shop not found");

        const tokens = await createTokenPair(
            { userId, email },
            holderToken.publicKey,
            holderToken.privateKey
        );

        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken,
            },
        });

        return {
            user: { userId, email },
            tokens,
        };
    };
    //------------------------------------------------------------------------------------------------
    static logOut = async (keyStore) => {
        if (!keyStore) {
            throw new BadRequestError("Invalid key store");
        }
        return await KeyTokenService.removeKeyById(keyStore._id);
    };
    //------------------------------------------------------------------------------------------------
    static logIn = async ({ email, password }) => {
        const foundShop = await findByEmail({ email });
        if (!foundShop) {
            throw new BadRequestError("Shop not found");
        }
        const match = await bcrypt.compare(password, foundShop.password);
        if (!match) {
            throw new AuthFailureError("Invalid password");
        }
        const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
            },
        });

        const tokens = await createTokenPair(
            {
                userId: foundShop._id,
                email,
            },
            publicKey,
            privateKey
        );

        await KeyTokenService.createKeyToken({
            userId: foundShop._id,
            publicKey,
            privateKey,
            refreshToken: tokens.refreshToken,
        });

        return {
            shop: getInfoData({
                fields: ["_id", "name", "email"],
                object: foundShop,
            }),
            tokens,
        };
    };
    //------------------------------------------------------------------------------------------------
    static signUp = async ({ name, email, password }) => {
        const holderShop = await shopModel.findOne({ email }).lean();
        if (holderShop) {
            throw new BadRequestError("Shop already exists");
        }
        const hashPassword = await bcrypt.hash(password, 10);

        const newShop = await shopModel.create({
            name,
            email,
            password: hashPassword,
            roles: [RoleShop.SHOP],
        });
        if (newShop) {
            const { publicKey, privateKey } = crypto.generateKeyPairSync(
                "rsa",
                {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: "pkcs1",
                        format: "pem",
                    },
                    privateKeyEncoding: {
                        type: "pkcs1",
                        format: "pem",
                    },
                }
            );

            const publicKeyString = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
            });

            if (!publicKeyString) {
                throw new BadRequestError("Invalid public key");
            }
            // const publicKeyObject = crypto.createPublicKey(publicKeyString);

            const tokens = await createTokenPair(
                {
                    userId: newShop._id,
                    email,
                },
                publicKeyString,
                privateKey
            );

            if (!tokens) {
                console.error("Failed to create token pair");
                throw new BadRequestError(
                    "Failed to create authentication tokens"
                );
            }

            return {
                code: "201",
                metadata: {
                    shop: getInfoData({
                        fields: ["_id", "name", "email"],
                        object: newShop,
                    }),
                    tokens,
                },
            };
        }
        return {
            code: "200",
            metadata: null,
        };
    };
    //------------------------------------------------------------------------------------------------
}

module.exports = AccessService;
