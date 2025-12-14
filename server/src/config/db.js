const mongoose = require('mongoose');

let mongoServer = null;

async function connectDB() {
  const useInMemory = process.env.USE_IN_MEMORY === 'true' || !process.env.MONGODB_URL;
  if (useInMemory) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to in-memory MongoDB');
    return;
  }
  await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB:', process.env.MONGODB_URL);
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}

module.exports = { connectDB, disconnectDB };