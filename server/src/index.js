const express = require('express');
const mongoose = require('mongoose');
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

const autoSeed = require('./seeds/seed'); // reuses seed.js (it exits process when run alone)
(async () => {
  await connectDB();
  if (process.env.USE_IN_MEMORY === 'true') {
    // seed in-memory DB without exiting the process
    const seed = require('./seeds/data');
    const mongoose = require('mongoose');
    const questionSchema = new mongoose.Schema({
      questionId: Number,
      text: String,
      answers: [{ text: String, frequency: Number, points: Number }],
    });
    const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
    const count = await Question.countDocuments();
    if (!count) {
      await Question.insertMany(seed);
      console.log('Auto-seeded in-memory DB');
    }
  }
})();