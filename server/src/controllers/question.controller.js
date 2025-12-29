const Question = require('../models/Question');

async function addQuestion(req, res) {
  let { questionId, text, answers } = req.body;
  if (!text) return res.status(400).json({ message: 'text required' });

  // if questionId not provided, assign next available numeric id
  if (!questionId) {
    const max = await Question.findOne().sort('-questionId').select('questionId').lean();
    questionId = max ? max.questionId + 1 : 1;
  }

  const question = new Question({ questionId, text, answers });
  await question.save();
  res.status(201).json(question);
}

async function listQuestions(req, res) {
  const qs = await Question.find().sort('questionId').lean();
  res.json(qs);
}

async function getQuestion(req, res) {
  const q = await Question.findById(req.params.id);
  if (!q) return res.status(404).json({ message: 'Question not found' });
  res.json(q);
}

async function updateQuestion(req, res) {
  const { id } = req.params;
  const { text, answers, questionId } = req.body;
  const q = await Question.findById(id);
  if (!q) return res.status(404).json({ message: 'Question not found' });
  if (text) q.text = text;
  if (Array.isArray(answers)) q.answers = answers;
  if (questionId) q.questionId = questionId;
  await q.save();
  res.json(q);
}

async function deleteQuestion(req, res) {
  const { id } = req.params;
  const q = await Question.findByIdAndDelete(id);
  if (!q) return res.status(404).json({ message: 'Question not found' });
  res.json({ message: 'Deleted' });
}

module.exports = {
  addQuestion,
  listQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
};