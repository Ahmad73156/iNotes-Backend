const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

const connectToMongo = () => {
    mongoose.connect(mongoURI)  // Remove options object here
        .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
        .catch((err) => console.error('❌ MongoDB connection error:', err));
};

module.exports = connectToMongo;
