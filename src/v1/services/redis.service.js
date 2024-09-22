"use strict";

const redis = require("redis");
const { promisify } = require("util");
const {
    reservationInventory,
} = require("../models/repositories/inventory.repo");
const redisClient = redis.createClient();

const pexpire = promisify(redisClient.pexpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setnx).bind(redisClient);

const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock:${productId}`;
    const requireTime = 10;
    const expireTime = 3000;

    for (let i = 0; i < requireTime; i++) {
        const isLock = await setnxAsync(key, expireTime);
        console.log("isLock", isLock);
        if (isLock === 1) {
            const isReservation = await reservationInventory({
                productId,
                quantity,
                cartId,
            });
            if (isReservation.modifiedCount) {
                await pexpire(key, expireTime);
                return key;
            }
            return null;
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
};

const releaseLock = async (key) => {
    const delAsyncKey = await redisClient.del(key).bind(redisClient);
    return await delAsyncKey(key);
};

module.exports = {
    acquireLock,
    releaseLock,
};
