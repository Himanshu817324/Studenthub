import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            console.error('❌ MONGODB_URI not found in .env file');
            return;
        }

        console.log('🔄 Testing MongoDB connection...');
        console.log('URI starts with:', mongoURI.substring(0, 20) + '...');

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ MongoDB connected successfully!');
        console.log('📊 Database:', mongoose.connection.db?.databaseName);

        await mongoose.disconnect();
        console.log('✅ Disconnected successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error(error);
        process.exit(1);
    }
};

testConnection();
