import mongoose from 'mongoose';

export const connectDB = async (customUri = null) => {
  const uri = customUri || process.env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] Failed to connect to: ${uri}`);
    console.error(`Reason: ${error.message}`);
    console.info(`[Startup Diagnostic] If running locally, please ensure the MongoDB service is active, or configure a valid MONGODB_URI (e.g., MongoDB Atlas connection string) in your server/.env file.`);
    // Do not exit in test mode
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[Warning] Running without active MongoDB connection. Database operations will queue or fail until connected.`);
    }
    return null;
  }
};

export const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

export default connectDB;
