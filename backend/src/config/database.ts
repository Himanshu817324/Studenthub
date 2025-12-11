import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error('MONGODB_URI not defined in environment variables');
        }

        console.log('🔄 Attempting to connect to MongoDB Atlas...');

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        });

        console.log('✅ MongoDB connected successfully');
        if (mongoose.connection.db) {
            console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
        }


        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected successfully');
        });

    } catch (error) {
        console.error('❌ MongoDB connection failed:');
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error name:', error.name);

            // Provide helpful debugging information
            if (error.message.includes('ENOTFOUND')) {
                console.error('💡 Hint: Check your network connection or MongoDB Atlas IP whitelist');
            } else if (error.message.includes('authentication failed')) {
                console.error('💡 Hint: Check your MongoDB Atlas username and password');
            } else if (error.message.includes('bad auth')) {
                console.error('💡 Hint: Ensure your connection string has the correct authentication database');
            }
        } else {
            console.error(error);
        }

        console.error('\n⚠️  Server will continue without database connection for debugging purposes');
        // Don't exit - allow server to run for debugging
        // process.exit(1);
    }
};

export default connectDB;
