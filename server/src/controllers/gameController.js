const Question = require('../models/Question');
const Game = require('../models/Game');

function generateCode(len = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

async function createGame(req, res) {
  // generate a unique code
  let code;
  let attempts = 0;
  while (!code && attempts < 10) {
    const candidate = generateCode(6);
    // check for collision
    // eslint-disable-next-line no-await-in-loop
    const exists = await Game.findOne({ code: candidate });
    if (!exists) code = candidate;
    attempts++;
  }

  if (!code) return res.status(500).json({ message: 'Unable to generate unique game code' });

  const game = new Game({ code, status: 'waiting' });
  await game.save();
  return res.status(201).json(game);
}

/* duplicate joinGame removed (consolidated later in file) */

async function getGame(req, res) {
  const g = await Game.findById(req.params.id);
  if (!g) return res.status(404).json({ message: 'Game not found' });
  res.json(g);
}

/* getGameByCode defined below (consolidated) */

async function joinGame(req, res) {
  const { code, name } = req.body;
  if (!code || !name) return res.status(400).json({ message: 'code and name required' });
  const c = code.toUpperCase();
  const game = await Game.findOne({ code: c });
  if (!game) return res.status(404).json({ message: 'Game not found' });
  if (game.status !== 'waiting') return res.status(400).json({ message: 'Game is not accepting players' });

  const player = { name: name.trim(), team: 'none' };
  game.players.push(player);
  await game.save();
  const added = game.players[game.players.length - 1];

  // emit lobby update to socket room
  const io = req.app.locals.io;
  try {
    io.to(`game_${game._id}`).emit('lobbyUpdate', { players: game.players, hostSocketId: game.hostSocketId });
  } catch (e) {
    // ignore if no io
  }

  res.json({ gameId: game._id, code: game.code, playerId: added._id, player: added });
}

async function addStrike(req, res) {
  const { gameId } = req.params;
  const { team } = req.body;
  if (!['A', 'B'].includes(team)) return res.status(400).json({ message: 'Invalid team' });
  const game = await Game.findById(gameId);
  if (!game) return res.status(404).json({ message: 'Game not found' });

  const idx = team === 'A' ? 0 : 1;
  game.teams[idx].strikes = (game.teams[idx].strikes || 0) + 1;
  await game.save();

  const io = req.app.locals.io;
  try {
    io.to(`game_${game._id}`).emit('strike', { gameId: game._id, teamIndex: idx, strikes: game.teams[idx].strikes });
    io.to(`game_${game._id}`).emit('playSound', { type: 'wrong' });
  } catch (e) {}

  res.json({ game });
}

async function passTurn(req, res) {
  const { gameId } = req.params;
  const game = await Game.findById(gameId);
  if (!game) return res.status(404).json({ message: 'Game not found' });

  if (game.currentTurnTeam === 'A') game.currentTurnTeam = 'B';
  else if (game.currentTurnTeam === 'B') game.currentTurnTeam = 'A';
  else game.currentTurnTeam = 'A';

  await game.save();
  const io = req.app.locals.io;
  try {
    io.to(`game_${game._id}`).emit('turn:changed', { gameId: game._id, team: game.currentTurnTeam });
  } catch (e) {}

  res.json({ game });
}

async function revealAnswerManual(req, res) {
  const { gameId } = req.params;
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'text required' });
  const game = await Game.findById(gameId);
  if (!game) return res.status(404).json({ message: 'Game not found' });
  const question = await Question.findOne({ questionId: game.currentQuestionId });
  if (!question) return res.status(400).json({ message: 'No active question' });

  const normalized = normalizeAns(text);
  const match = question.answers.find((a) => normalizeAns(a.text) === normalized && !game.revealedAnswers.some((r) => normalizeAns(r.text) === normalized));
  const io = req.app.locals.io;
  if (!match) return res.status(404).json({ message: 'Answer not found or already revealed' });

  const points = (match.points || match.frequency) * (game.multiplier || 1);
  game.revealedAnswers.push({ text: match.text, points });
  // optionally assign points to currentTurnTeam
  if (game.currentTurnTeam) {
    const idx = game.currentTurnTeam === 'A' ? 0 : 1;
    game.teams[idx].score += points;
  }
  await game.save();

  try {
    io.to(`game_${game._id}`).emit('revealAnswer', { gameId: game._id, text: match.text, points, teamIndex: game.currentTurnTeam ? (game.currentTurnTeam === 'A' ? 0 : 1) : null });
    io.to(`game_${game._id}`).emit('updateScores', { gameId: game._id, teams: game.teams });
    io.to(`game_${game._id}`).emit('playSound', { type: 'correct' });
  } catch (e) {}

  res.json({ game, text: match.text, points });
}

async function startGame(req, res) {
  const { gameId } = req.params;
  const game = await Game.findById(gameId);
  if (!game) return res.status(404).json({ message: 'Game not found' });
  game.status = 'active';
  game.phase = 'round';
  // default to Team A control at start
  game.currentTurnTeam = 'A';
  await game.save();

  // emit gameStarted
  const io = req.app.locals.io;
  try {
    io.to(`game_${game._id}`).emit('gameStarted', { gameId: game._id });
    io.to(`game_${game._id}`).emit('turn:changed', { gameId: game._id, team: game.currentTurnTeam });
  } catch (e) {}

  res.json({ game });
}

async function getGameByCode(req, res) {
  const code = (req.params.code || '').toUpperCase();
  const g = await Game.findOne({ code });
  if (!g) return res.status(404).json({ message: 'Game not found' });
  res.json(g);
}

async function joinGame(req, res) {
  const { code, name } = req.body;
  if (!code || !name) return res.status(400).json({ message: 'code and name are required' });

  const g = await Game.findOne({ code: code.toUpperCase() });
  if (!g) return res.status(404).json({ message: 'Game not found' });
  if (g.status !== 'waiting') return res.status(400).json({ message: 'Game has already started' });

  const sanitized = name.trim().slice(0, 30);
  const newPlayer = { name: sanitized };
  g.players.push(newPlayer);
  await g.save();
  const added = g.players[g.players.length - 1];

  // notify sockets that a player joined
  try {
    const io = req.app.locals.io;
    io.to(`game_${g._id}`).emit('lobbyUpdate', { players: g.players.map(p => ({ _id: p._id, name: p.name, team: p.team, joinedAt: p.joinedAt })) });
    io.emit('playerJoined', { gameId: g._id, player: { _id: added._id, name: added.name } });
  } catch (e) {
    // ignore socket errors
  }

  res.status(201).json({ gameId: g._id, code: g.code, playerId: added._id, player: added, players: g.players });
}

async function startRound(req, res) {
  const { gameId, questionId, duration = 20 } = req.body;
  const game = await Game.findById(gameId);
  if (!game) return res.status(404).json({ message: 'Game not found' });
  const q = await Question.findOne({ questionId });
  if (!q) return res.status(404).json({ message: 'Question not found' });
  game.currentQuestionId = questionId;
  game.revealedAnswers = [];
  game.phase = 'round';
  // set timer defaults
  game.timer.duration = duration;
  game.timer.remaining = duration;
  game.timer.running = true;
  await game.save();

  // emit startRound
  const io = req.app.locals.io;
  io.emit('startRound', { gameId: game._id, questionId: q.questionId, text: q.text, duration });

  // start server-side countdown and emit updateTimer per second (clears when done)
  startTimerInternal(io, game._id.toString(), duration);

  res.json({ game, question: { questionId: q.questionId, text: q.text, answersCount: q.answers.length } });
}

function normalizeAns(s) {
  if (!s) return '';
  return s.trim().toLowerCase();
}

async function submitAnswer(req, res) {
  const { gameId } = req.params;
  const { teamIndex, answer } = req.body;
  const game = await Game.findById(gameId);
  if (!game) return res.status(404).json({ message: 'Game not found' });
  const question = await Question.findOne({ questionId: game.currentQuestionId });
  if (!question) return res.status(400).json({ message: 'No active question' });

  const normalized = normalizeAns(answer);
  const match = question.answers.find(
    (a) => normalizeAns(a.text) === normalized && !game.revealedAnswers.some((r) => normalizeAns(r.text) === normalized)
  );

  const io = req.app.locals.io;
  if (match) {
    const points = (match.points || match.frequency) * (game.multiplier || 1);
    game.revealedAnswers.push({ text: match.text, points });
    game.teams[teamIndex].score += points;
    await game.save();

    // emit reveal & updated scores & play sound
    io.to(`game_${game._id}`).emit('revealAnswer', { gameId: game._id, text: match.text, points, teamIndex });
    io.to(`game_${game._id}`).emit('updateScores', { gameId: game._id, teams: game.teams });
    io.to(`game_${game._id}`).emit('playSound', { type: 'correct' });
    return res.json({ correct: true, text: match.text, points, game });
  } else {
    game.teams[teamIndex].strikes = (game.teams[teamIndex].strikes || 0) + 1;
    const strikes = game.teams[teamIndex].strikes;
    await game.save();

    // emit strike & play wrong sound
    io.to(`game_${game._id}`).emit('strike', {
      gameId: game._id,
      teamIndex,
      strikes,
    });
    io.to(`game_${game._id}`).emit('playSound', { type: 'wrong' });
    return res.json({ correct: false, strikes, game });
  }
}

async function startFastMoney(req, res) {
  const { gameId } = req.params;
  const game = await Game.findById(gameId);
  if (!game) return res.status(404).json({ message: 'Game not found' });
  game.phase = 'fast-money';
  game.fastMoney = []; // reset
  await game.save();

  // emit that fast-money started
  try {
    const io = req.app.locals.io;
    io.to(`game_${game._id}`).emit('fastMoney:started', { gameId: game._id });
  } catch (e) {}

  res.json(game);
}

async function getFastMoneyQuestions(req, res) {
  const { gameId } = req.params;
  const game = await Game.findById(gameId);
  if (!game) return res.status(404).json({ message: 'Game not found' });
  // sample 5 questions randomly
  const questions = await Question.aggregate([{ $sample: { size: 5 } }, { $project: { questionId: 1, text: 1 } }]);
  res.json({ questions });
}

async function submitFastMoney(req, res) {
  const { gameId } = req.params;
  const { playerIndex, answers /* [{questionId, answer}] */ } = req.body;
  const game = await Game.findById(gameId);
  if (!game) return res.status(404).json({ message: 'Game not found' });

  let total = 0;
  const results = [];
  for (const a of answers) {
    const q = await Question.findOne({ questionId: a.questionId });
    if (!q) {
      results.push({ questionId: a.questionId, correct: false, points: 0 });
      continue;
    }
    const match = q.answers.find((ans) => ans.text.toLowerCase() === (a.answer || '').trim().toLowerCase());
    const pts = match ? (match.points || match.frequency) : 0;
    total += pts;
    results.push({ questionId: a.questionId, answer: a.answer, points: pts });
  }

  game.fastMoney[playerIndex] = { playerAnswers: results, total };

  // emit that this player submitted
  try {
    const io = req.app.locals.io;
    io.to(`game_${game._id}`).emit('fastMoney:playerSubmitted', { gameId: game._id, playerIndex, total });
  } catch (e) {}

  // if both players submitted, compute bonus and finalize
  if (game.fastMoney.filter(Boolean).length >= 2) {
    let grand = game.fastMoney[0].total + game.fastMoney[1].total;
    if (grand > 100) {
      grand += 500; // bonus
    }
    // add to the winning team (highest score so far)
    const winnerTeamIndex = game.teams[0].score >= game.teams[1].score ? 0 : 1;
    game.teams[winnerTeamIndex].score += grand;
    game.phase = 'finished';
    // emit final results
    try {
      const io = req.app.locals.io;
      io.to(`game_${game._id}`).emit('fastMoney:complete', { gameId: game._id, fastMoney: game.fastMoney, grand, winnerTeamIndex });
      io.to(`game_${game._id}`).emit('updateScores', { gameId: game._id, teams: game.teams });
      io.to(`game_${game._id}`).emit('playSound', { type: 'correct' });
    } catch (e) {}
  }

  await game.save();
  res.json({ game });
}


// ---------------------- Timer support ----------------------

const timers = new Map(); // gameId -> { remaining, duration, interval }

function emitTimerUpdate(io, gameId, remaining) {
  io.to(`game_${gameId}`).emit('timer:update', { gameId, remaining });
}

function startTimerInternal(io, gameId, duration) {
  // clear existing
  if (timers.has(gameId)) {
    const t = timers.get(gameId);
    clearInterval(t.interval);
    timers.delete(gameId);
  }
  const state = { remaining: duration, duration, interval: null };
  emitTimerUpdate(io, gameId, state.remaining);
  state.interval = setInterval(async () => {
    state.remaining -= 1;
    // emit per-second updates
    emitTimerUpdate(io, gameId, state.remaining);
    // emit warning at 5s
    if (state.remaining === 5) {
      io.to(`game_${gameId}`).emit('timer:warning', { gameId, remaining: 5 });
      io.to(`game_${gameId}`).emit('playSound', { type: 'warning' });
    }
    if (state.remaining <= 0) {
      clearInterval(state.interval);
      timers.delete(gameId);
      io.to(`game_${gameId}`).emit('timer:finished', { gameId });
      // also set game.timer.running = false and remaining 0
      try {
        const g = await Game.findById(gameId);
        if (g) {
          g.timer.remaining = 0;
          g.timer.running = false;
          await g.save();
        }
      } catch (e) {
        // ignore
      }
    } else {
      // persist remaining occasionally (optional)
      try {
        const g = await Game.findById(gameId);
        if (g) {
          g.timer.remaining = state.remaining;
          await g.save();
        }
      } catch (e) {}
    }
  }, 1000);
  timers.set(gameId, state);
}

async function timerStart(req, res) {
  const { gameId } = req.params;
  const { duration } = req.body;
  const g = await Game.findById(gameId);
  if (!g) return res.status(404).json({ message: 'Game not found' });
  const dur = Number.isFinite(duration) && duration > 0 ? duration : (g.timer?.duration || 20);
  g.timer.duration = dur;
  g.timer.remaining = dur;
  g.timer.running = true;
  await g.save();
  const io = req.app.locals.io;
  startTimerInternal(io, g._id.toString(), dur);
  res.json({ game: g, duration: dur });
}

async function timerPause(req, res) {
  const { gameId } = req.params;
  const g = await Game.findById(gameId);
  if (!g) return res.status(404).json({ message: 'Game not found' });
  const t = timers.get(String(g._id));
  if (t) {
    clearInterval(t.interval);
    timers.delete(String(g._id));
  }
  g.timer.running = false;
  await g.save();
  const io = req.app.locals.io;
  io.to(`game_${g._id}`).emit('timer:paused', { gameId: g._id, remaining: g.timer.remaining });
  res.json({ remaining: g.timer.remaining });
}

async function timerReset(req, res) {
  const { gameId } = req.params;
  const { duration } = req.body;
  const g = await Game.findById(gameId);
  if (!g) return res.status(404).json({ message: 'Game not found' });
  const dur = Number.isFinite(duration) && duration > 0 ? duration : (g.timer?.duration || 20);
  g.timer.duration = dur;
  g.timer.remaining = dur;
  g.timer.running = false;
  await g.save();
  // clear any running timer
  const t = timers.get(String(g._id));
  if (t) {
    clearInterval(t.interval);
    timers.delete(String(g._id));
  }
  const io = req.app.locals.io;
  io.to(`game_${g._id}`).emit('timer:reset', { gameId: g._id, duration: dur, remaining: dur });
  res.json({ duration: dur, remaining: dur });
}

async function timerStatus(req, res) {
  const { gameId } = req.params;
  const g = await Game.findById(gameId);
  if (!g) return res.status(404).json({ message: 'Game not found' });
  res.json({ duration: g.timer.duration, remaining: g.timer.remaining, running: g.timer.running });
}

module.exports = {
  createGame,
  getGame,
  getGameByCode,
  joinGame,
  changePlayerTeam,
  startGame,
  startRound,
  submitAnswer,
  startFastMoney,
  submitFastMoney,
  // timer
  timerStart,
  timerPause,
  timerReset,
  timerStatus,
  // internal helper (exported for socket usage)
  startTimerInternal,
};