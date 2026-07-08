const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is missing');
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected Successfully');
        return conn;
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
