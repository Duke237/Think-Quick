const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  team: {
    type: String,
    required: true,
    enum: ['A', 'B']
  },
  socketId: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const roundSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true
  },
  questionId: {
    type: String,
    required: true
  },
  multiplier: {
    type: Number,
    default: 1
  },
  teamAScore: {
    type: Number,
    default: 0
  },
  teamBScore: {
    type: Number,
    default: 0
  },
  strikes: {
    type: Number,
    default: 0
  },
  activeTeam: {
    type: String,
    enum: ['A', 'B']
  },
  revealedAnswers: [{
    text: String,
    points: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending'
  },
  startedAt: Date,
  completedAt: Date
});

const gameSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  hostSocketId: {
    type: String,
    required: true
  },
  players: [playerSchema],
  rounds: [roundSchema],
  currentRound: {
    type: Number,
    default: 0
  },
  teamAScore: {
    type: Number,
    default: 0
  },
  teamBScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'paused', 'completed'],
    default: 'waiting'
  },
  gameMode: {
    type: String,
    enum: ['standard', 'fastMoney'],
    default: 'standard'
  },
  settings: {
    maxStrikes: {
      type: Number,
      default: 3
    },
    timerSeconds: {
      type: Number,
      default: 20
    },
    roundMultipliers: {
      type: [Number],
      default: [1, 2, 3]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, {
  timestamps: true
});

// Method to add a player
gameSessionSchema.methods.addPlayer = function(name, team, socketId) {
  const player = { name, team, socketId, isActive: true };
  this.players.push(player);
  return this.save();
};

// Method to start a new round
gameSessionSchema.methods.startRound = function(questionId, multiplier = 1, activeTeam = 'A') {
  const roundNumber = this.currentRound + 1;
  this.rounds.push({
    roundNumber,
    questionId,
    multiplier,
    activeTeam,
    status: 'active',
    startedAt: new Date()
  });
  this.currentRound = roundNumber;
  return this.save();
};

// Method to get current round
gameSessionSchema.methods.getCurrentRound = function() {
  return this.rounds.find(r => r.roundNumber === this.currentRound);
};

module.exports = mongoose.model('GameSession', gameSessionSchema);