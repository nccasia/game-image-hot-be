import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const { connect, connection } = mongoose;

export const connectToDatabase = async (): Promise<void> => {
  const isProd = process.env.NODE_ENV === 'production';
  let uri = '';

  if (!isProd) {
    // Development (Localhost)
    uri = `mongodb://${process.env.DB_URI}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    await connect(uri, {
      dbName: process.env.DB_NAME,
      user: process.env.DB_USER,
      pass: process.env.DB_PASS,
    });
  } else {
    // Production (MongoDB Atlas or similar)
    uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URI}/${process.env.DB_NAME}?authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;
    await connect(uri);
  }

  console.log('✅ Connection established with MongoDB');
};

// Setup connection listeners
connection.on('connected', () => {
  console.log('🔗 Mongoose connected to DB Cluster');
});

connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error.message);
});

connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected');
});