const Question = require('../models/Question');
const Game = require('../models/Game');

async function createGame(req, res) {
  const game = new Game();
  await game.save();
  return res.status(201).json(game);
}

async function getGame(req, res) {
  const g = await Game.findById(req.params.id);
  if (!g) return res.status(404).json({ message: 'Game not found' });
  res.json(g);
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
    io.emit('revealAnswer', { gameId: game._id, text: match.text, points, teamIndex });
    io.emit('updateScores', { gameId: game._id, teams: game.teams });
    io.emit('playSound', { type: 'correct' });
    return res.json({ correct: true, text: match.text, points, game });
  } else {
    game.teams[teamIndex].strikes = (game.teams[teamIndex].strikes || 0) + 1;
    const strikes = game.teams[teamIndex].strikes;
    await game.save();

    // emit strike & play wrong sound
    io.emit('strike', {
      gameId: game._id,
      teamIndex,
      strikes,
    });
    io.emit('playSound', { type: 'wrong' });
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
  res.json(game);
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
  // if both players submitted, compute bonus
  if (game.fastMoney.filter(Boolean).length >= 2) {
    let grand = game.fastMoney[0].total + game.fastMoney[1].total;
    if (grand > 100) {
      grand += 500; // bonus
    }
    // add to the winning team (highest score so far)
    const winnerTeamIndex = game.teams[0].score >= game.teams[1].score ? 0 : 1;
    game.teams[winnerTeamIndex].score += grand;
    game.phase = 'finished';
  }
  await game.save();
  res.json({ game });
}

module.exports = {
  createGame,
  getGame,
  startRound,
  submitAnswer,
  startFastMoney,
  submitFastMoney,
};