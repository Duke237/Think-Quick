const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: { type: String, default: 'Team' },
  score: { type: Number, default: 0 },
  strikes: { type: Number, default: 0 },
});

const FastMoneySchema = new mongoose.Schema({
  playerAnswers: [{ questionId: Number, answer: String, points: Number }],
  total: { type: Number, default: 0 },
});

const GameSchema = new mongoose.Schema({
  teams: { type: [TeamSchema], default: [{ name: 'Team A' }, { name: 'Team B' }] },
  roundNumber: { type: Number, default: 1 }, // 1..3 normal rounds
  multiplier: { type: Number, default: 1 },
  currentQuestionId: { type: Number, default: null },
  revealedAnswers: [{ text: String, points: Number }],
  phase: { type: String, enum: ['lobby', 'round', 'fast-money', 'finished'], default: 'lobby' },
  fastMoney: { type: [FastMoneySchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Game || mongoose.model('Game', GameSchema);