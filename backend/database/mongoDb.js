const mongoose = require('mongoose');

const mongoDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/inventory`);

        console.log("✅ Database Connected");

        mongoose.connection.on('connected', () => {
            console.log("Mongoose connected to the database");
        });

        mongoose.connection.on('error', (err) => {
            console.error("Mongoose connection error:", err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log("Mongoose disconnected from the database");
        });

    } catch (err) {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    }
};

module.exports = mongoDB;
