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
  teamId: { type: Number, required: true }
});

const revealedAnswerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  frequency: { type: Number, required: true },
  revealedAt: { type: Date, default: Date.now }
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
    enum: ['setup', 'playing', 'round-end', 'game-over'],
    default: 'setup'
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
  teams: [teamSchema],
  players: [playerSchema],
  currentQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  revealedAnswers: [revealedAnswerSchema],
  timer: {
    value: { type: Number, default: 30 },
    isRunning: { type: Boolean, default: false }
  },
  settings: {
    roundDuration: { type: Number, default: 30 },
    maxStrikes: { type: Number, default: 3 },
    voiceControlEnabled: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Generate unique game code
gameSessionSchema.statics.generateGameCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Calculate round multiplier
gameSessionSchema.methods.getRoundMultiplier = function() {
  return this.currentRound;
};

// Add player
gameSessionSchema.methods.addPlayer = function(name, teamId) {
  const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  this.players.push({ id: playerId, name, teamId });
  return playerId;
};

// Award points
gameSessionSchema.methods.awardPoints = function(teamId, points) {
  const team = this.teams.find(t => t.id === teamId);
  if (team) {
    team.score += points * this.getRoundMultiplier();
  }
};

export default mongoose.model('GameSession', gameSessionSchema);