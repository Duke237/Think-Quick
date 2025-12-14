require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const data = require('./data');
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: Number,
  text: String,
  answers: [{ text: String, frequency: Number, points: Number }],
});
const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

async function run() {
  const forceInMemory = process.argv.includes('--inmemory');
  if (forceInMemory) process.env.USE_IN_MEMORY = 'true';
  await connectDB();
  await Question.deleteMany({});
  await Question.insertMany(data);
  console.log('Seed completed: inserted', data.length, 'questions');
  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});