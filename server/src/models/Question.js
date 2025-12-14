const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  frequency: { type: Number, required: true }, // 0-100 (points)
  points: { type: Number }, // derived from frequency if omitted
  revealed: { type: Boolean, default: false },
});

const QuestionSchema = new mongoose.Schema({
  questionId: { type: Number, required: true, unique: true },
  text: { type: String, required: true },
  answers: [AnswerSchema],
});

QuestionSchema.pre('save', function (next) {
  this.answers.forEach((a) => {
    if (a.points == null) a.points = a.frequency;
  });
  next();
});

module.exports = mongoose.models.Question || mongoose.model('Question', QuestionSchema);