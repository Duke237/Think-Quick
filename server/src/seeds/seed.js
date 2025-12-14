require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const data = require('./data');
const mongoose = require('mongoose');
const Question = require('../models/Question');

async function run(forceInMemory = false) {
  if (forceInMemory) process.env.USE_IN_MEMORY = 'true';
  await connectDB();
  await Question.deleteMany({});
  await Question.insertMany(data);
  console.log('Seed completed: inserted', data.length, 'questions');
  await disconnectDB();
  process.exit(0);
}

if (require.main === module) {
  const force = process.argv.includes('--inmemory');
  run(force).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = run;