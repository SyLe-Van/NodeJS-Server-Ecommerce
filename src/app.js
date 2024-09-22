"use strict";
const express = require("express");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cors = require("cors");
require("dotenv").config();
//init dbs
require("./v1/databases/init.mongodb");
// require('./v1/databases/init.redis')

//init middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());

// add body-parser
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

//router
app.use(require("./v1/routes/index.js"));
//handling error
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        status: "error",
        code: statusCode,
        // stack: error.stack,
        message: error.message || "Internal Server Error",
    });
});

module.exports = app;
