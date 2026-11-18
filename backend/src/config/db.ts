import mongoose from 'mongoose';

export let isConnected = false;
export let isUsingMockStore = false;

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nynk';

  try {
    mongoose.set('strictQuery', false);
    // Attempt connecting with a short 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    isUsingMockStore = false;
    console.log(`[Database] Successfully connected to MongoDB at ${uri}`);
    return true;
  } catch (error: any) {
    console.warn(`[Database] MongoDB connection to ${uri} failed (${error.message}).`);
    console.warn('[Database] Activating NYNK In-Memory High-Speed Mock Store for seamless standalone execution.');
    isConnected = false;
    isUsingMockStore = true;
    return false;
  }
};

