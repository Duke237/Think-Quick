import GameSession from '../models/GameSession.js';

export const createGame = async (req, res) => {
  try {
    const { hostId } = req.body;
    
    if (!hostId) {
      return res.status(400).json({ error: 'Host ID is required' });
    }

    // Generate unique game code
    let gameCode;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      gameCode = GameSession.generateGameCode();
      const existing = await GameSession.findOne({ gameCode });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate unique game code' });
    }

    // Create new game session
    const game = new GameSession({
      gameCode,
      hostId,
      status: 'lobby'
    });

    await game.save();

    console.log(` Game created: ${gameCode} by host: ${hostId}`);

    res.status(201).json({ 
      success: true,
      game: {
        gameCode: game.gameCode,
        status: game.status,
        teams: game.teams,
        players: game.players,
        createdAt: game.createdAt
      }
    });
  } catch (error) {
    console.error(' Create game error:', error);
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
    
    res.json({ 
      success: true,
      game 
    });
  } catch (error) {
    console.error(' Get game error:', error);
    res.status(500).json({ error: error.message });
  }
};