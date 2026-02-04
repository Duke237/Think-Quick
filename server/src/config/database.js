const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    const useInMemory = process.env.USE_IN_MEMORY === 'true';
    
    let mongoUri;
    
    if (useInMemory) {
      console.log('🔄 Starting in-memory MongoDB...');
      mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log('✅ In-memory MongoDB started');
    } else {
      mongoUri = process.env.MONGODB_URL || 'mongodb://localhost:27017/think-quick-app';
      console.log('🔄 Connecting to MongoDB...');
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${useInMemory ? 'In-Memory' : mongoUri}`);

    // Auto-seed if in-memory and database is empty
    if (useInMemory) {
      const Question = require('../models/Question');
      const count = await Question.countDocuments();
      if (count === 0) {
        console.log('📦 Database empty, auto-seeding...');
        const { seedQuestions } = require('../seeds/seedDB');
        await seedQuestions();
        console.log('✅ Auto-seeding completed');
      }
    }

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };