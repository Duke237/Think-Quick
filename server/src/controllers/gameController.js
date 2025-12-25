import GameSession from '../models/GameSession.js';
import Question from '../models/Question.js';

export const createGame = async (req, res) => {
  try {
    const { hostId } = req.body;
    
    let gameCode;
    let isUnique = false;
    
    while (!isUnique) {
      gameCode = GameSession.generateGameCode();
      const existing = await GameSession.findOne({ gameCode });
      if (!existing) isUnique = true;
    }

    const game = new GameSession({
      gameCode,
      hostId,
      teams: [
        { id: 1, name: 'Team 1', score: 0, color: '#00E5FF' },
        { id: 2, name: 'Team 2', score: 0, color: '#FF9F1C' }
      ]
    });

    await game.save();
    res.status(201).json({ game });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGame = async (req, res) => {
  try {
    const { gameCode } = req.params;
    const game = await GameSession.findOne({ gameCode })
      .populate('currentQuestion');
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ game });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addPlayer = async (req, res) => {
  try {
    const { gameCode } = req.params;
    const { name, teamId } = req.body;
    
    const game = await GameSession.findOne({ gameCode });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const playerId = game.addPlayer(name, teamId);
    await game.save();
    
    res.json({ game, playerId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const startGame = async (req, res) => {
  try {
    const { gameCode } = req.params;
    
    const game = await GameSession.findOne({ gameCode });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    if (game.players.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 players' });
    }

    // Get random question
    const questions = await Question.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 1 } }
    ]);
    
    game.currentQuestion = questions[0]._id;
    game.status = 'playing';
    await game.save();
    
    const populatedGame = await game.populate('currentQuestion');
    res.json({ game: populatedGame });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};