const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  points: {
    type: Number,
    default: function() {
      return this.frequency; // Points = frequency by default
    }
  },
  revealed: {
    type: Boolean,
    default: false
  }
});

const questionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  answers: [answerSchema],
  sampleSize: {
    type: Number,
    default: 100
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isFastMoney: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Validate that answer frequencies sum to 100 (or close to it)
questionSchema.pre('save', function(next) {
  if (this.answers && this.answers.length > 0) {
    const totalFrequency = this.answers.reduce((sum, answer) => sum + answer.frequency, 0);
    if (Math.abs(totalFrequency - 100) > 5) { // Allow 5% tolerance
      return next(new Error(`Answer frequencies must sum to ~100. Current total: ${totalFrequency}`));
    }
  }
  next();
});

// Sort answers by frequency (highest first) before saving
questionSchema.pre('save', function(next) {
  if (this.answers) {
    this.answers.sort((a, b) => b.frequency - a.frequency);
  }
  next();
});

module.exports = mongoose.model('Question', questionSchema);