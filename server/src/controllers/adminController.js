const Question = require('../models/Question');

async function addQuestion(req, res) {
  const { questionId, text, answers } = req.body;
  const question = new Question({ questionId, text, answers });
  await question.save();
  res.status(201).json(question);
}

module.exports = {
  addQuestion,
};