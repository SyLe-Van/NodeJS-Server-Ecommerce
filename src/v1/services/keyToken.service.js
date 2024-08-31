"use strict";
const keytokenModel = require("../models/keytoken.model");
const { Types } = require("mongoose");
class KeyTokenService {
    static createKeyToken = async ({
        userId,
        publicKey,
        privateKey,
        refreshToken,
    }) => {
        try {
            const filter = { user: userId },
                update = {
                    publicKey,
                    privateKey,
                    refreshTokensUsed: [],
                    refreshToken: refreshToken,
                },
                options = { upsert: true, new: true };
            const tokens = await keytokenModel.findOneAndUpdate(
                filter,
                update,
                options
            );
            console.log("Created/Updated token:", tokens);
            return tokens ? tokens.publicKey : null;
        } catch (error) {
            console.error("Error in createKeyToken:", error);
            throw error;
        }
    };

    static findByUserId = async (userId) => {
        console.log("Searching for userId:", userId);
        return await keytokenModel
            .findOne({ user: Types.ObjectId(userId) })
            .lean();
    };

    static removeKeyById = async (id) => {
        return await keytokenModel.deleteOne({ _id: id });
    };
    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keytokenModel
            .findOne({ refreshTokensUsed: refreshToken })
            .lean();
    };
    static findByRefreshToken = async (refreshToken) => {
        return await keytokenModel.findOne({ refreshToken });
    };
    static deleteKeyById = async (userId) => {
        return await keytokenModel.deleteOne({
            user: new Types.ObjectId(userId),
        });
    };
}

module.exports = KeyTokenService;
