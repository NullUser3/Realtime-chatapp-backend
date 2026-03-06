import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI, { dbName: "realtime_chat_app" }); 
  } catch (error) {
    console.error(`Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
