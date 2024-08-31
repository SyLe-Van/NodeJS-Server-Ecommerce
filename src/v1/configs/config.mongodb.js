"use strict";
const { mongo } = require("mongoose");

const development = {
    app: {
        port: process.env.DEV_APP_PORT,
    },
    db: {
        mongo_user: process.env.DEV_DB_USER,
        mongo_password: process.env.DEV_DB_PASSWORD,
        mongo_default_database: process.env.DEV_DB_DATABASE,
    },
};

const production = {
    app: {
        port: process.env.PROD_APP_PORT,
    },
    db: {
        mongo_user: process.env.PROD_DB_USER,
        mongo_password: process.env.PROD_DB_PASSWORD,
        mongo_default_database: process.env.PROD_DB_DATABASE,
    },
};
const config = { development, production };
const env = process.env.NODE_ENV || "development";
module.exports = config[env];
