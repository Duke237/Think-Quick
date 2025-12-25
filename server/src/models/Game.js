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
  // unique room code (e.g., 6 uppercase alphanumeric chars)
  code: { type: String, required: true, unique: true, index: true },
  // status of the game session
  status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'waiting' },
  // players who joined the game
  players: {
    type: [
      new mongoose.Schema({
        name: { type: String, required: true },
        team: { type: String, enum: ['A','B','none'], default: 'none' },
        socketId: { type: String, default: null },
        joinedAt: { type: Date, default: Date.now },
      })
    ],
    default: [],
  },
  // optional host socket id to identify the host connection
  hostSocketId: { type: String, default: null },
  // which team has current control (A or B)
  currentTurnTeam: { type: String, enum: ['A','B', null], default: null },
  // timer state (in seconds)
  timer: {
    duration: { type: Number, default: 20 },
    remaining: { type: Number, default: 0 },
    running: { type: Boolean, default: false },
  },
  fastMoney: { type: [FastMoneySchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Game || mongoose.model('Game', GameSchema);