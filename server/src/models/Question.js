import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  frequency: { type: Number, required: true, min: 0, max: 100 }
});

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answers: {
    type: [answerSchema],
    validate: {
      validator: function(answers) {
        const total = answers.reduce((sum, ans) => sum + ans.frequency, 0);
        return total === 100;
      },
      message: 'Answer frequencies must total 100'
    }
  },
  category: {
    type: String,
    default: 'general'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Question', questionSchema);