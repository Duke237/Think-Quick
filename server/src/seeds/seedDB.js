const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('../models/Question');
const { allQuestions } = require('./data');

// Load environment variables
dotenv.config();

// Seed function to populate questions
const seedQuestions = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing questions
    const deleteResult = await Question.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing questions`);

    // Insert new questions
    const insertedQuestions = await Question.insertMany(allQuestions);
    console.log(`✅ Successfully seeded ${insertedQuestions.length} questions`);

    // Display summary by category
    const categories = {};
    insertedQuestions.forEach(q => {
      categories[q.category] = (categories[q.category] || 0) + 1;
    });

    console.log('\n📊 Questions by category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} questions`);
    });

    // Display Fast Money questions count
    const fastMoneyCount = insertedQuestions.filter(q => q.isFastMoney).length;
    console.log(`\n⚡ Fast Money questions: ${fastMoneyCount}`);

    return insertedQuestions;

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    throw error;
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/database');
  
  (async () => {
    try {
      await connectDB();
      await seedQuestions();
      await disconnectDB();
      console.log('\n✅ Seeding completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = { seedQuestions };