import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  score: { type: Number, default: 0 },
  color: { type: String, required: true }
});

const playerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  teamId: { type: Number, required: true },
  joinedAt: { type: Date, default: Date.now }
});

const gameSessionSchema = new mongoose.Schema({
  gameCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 6
  },
  hostId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['lobby', 'playing', 'clock', 'round-end', 'game-over'],
    default: 'lobby'
  },
  currentRound: {
    type: Number,
    default: 1,
    min: 1,
    max: 3
  },
  currentTeamIndex: {
    type: Number,
    default: 0
  },
  strikes: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  teams: {
    type: [teamSchema],
    default: [
      { id: 1, name: 'Team Alpha', score: 0, color: '#00E5FF' },
      { id: 2, name: 'Team Beta', score: 0, color: '#FF9F1C' }
    ]
  },
  players: [playerSchema],
  currentQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    default: null
  },
  revealedAnswers: [{
    text: String,
    frequency: Number,
    revealedAt: { type: Date, default: Date.now }
  }],
  timer: {
    value: { type: Number, default: 25 },
    isRunning: { type: Boolean, default: false }
  },
  settings: {
    roundDuration: { type: Number, default: 25 },
    maxStrikes: { type: Number, default: 3 },
    voiceControlEnabled: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

gameSessionSchema.statics.generateGameCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

gameSessionSchema.methods.getRoundMultiplier = function() {
  return this.currentRound;
};

export default mongoose.model('GameSession', gameSessionSchema);