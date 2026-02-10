const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Question = require('../models/Question');
const { QUESTIONS } = require('./data');

async function seedDatabase() {
  let mongoServer;
  
  try {
    console.log('🌱 Starting manual database seeding...');
    
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to in-memory MongoDB');

    // Clear existing questions
    const deletedCount = await Question.deleteMany({});
    console.log(`🗑️  Cleared ${deletedCount.deletedCount || 0} existing questions`);

    // Insert questions
    const insertedQuestions = await Question.insertMany(QUESTIONS);
    console.log(`✅ Successfully seeded ${insertedQuestions.length} questions`);

    // Count by category
    const categories = {};
    insertedQuestions.forEach(q => {
      categories[q.category] = (categories[q.category] || 0) + 1;
    });

    console.log('📊 Questions by category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} questions`);
    });

    console.log('✅ Seeding completed successfully');
    
    await mongoose.disconnect();
    await mongoServer.stop();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.exit(1);
  }
}

seedDatabase();