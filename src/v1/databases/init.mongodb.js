"use strict";
const mongoose = require("mongoose");
const {
    db: { mongo_user, mongo_password, mongo_default_database },
} = require("../configs/config.mongodb");
const mongoUri = `mongodb+srv://${mongo_user}:${mongo_password}@cluster0.76jur.mongodb.net/${mongo_default_database}`;

class Database {
    constructor() {
        this.connect();
    }

    connect() {
        if (process.env.NODE_ENV === "development") {
            mongoose.set("debug", true);
            mongoose.set("debug", { color: true });
        }
        mongoose
            .connect(mongoUri, {
                maxPoolSize: 70,
            })
            .then(() => console.log("Connected to MongoDB successfully!"))
            .catch((err) => {
                console.error(`Error connecting to MongoDB:`, err);
                process.exit(1);
            });
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

module.exports = Database.getInstance();
