"use strict";
const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECONDS = 5;
//count connect
const countConnect = () => {
    const numConnection = mongoose.connections.length;
    console.log(`Number of connections:::${numConnection}`);
};

//check over load
const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;
        const maxConnections = numCores * 5;

        console.log(`Memory usage:::${memoryUsage / 1024 / 1024} MB`);
        if (numConnection > maxConnections) {
            console.log(`Connection overload detected!`);
        }
    }, _SECONDS * 1000);
};
module.exports = { countConnect, checkOverload };
