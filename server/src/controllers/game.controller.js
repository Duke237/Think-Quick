import GameSession from '../models/GameSession.js';

export const createGame = async (req, res) => {
  try {
    const { hostId } = req.body;
    
    if (!hostId) {
      return res.status(400).json({ error: 'Host ID is required' });
    }

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

    const game = new GameSession({
      gameCode,
      hostId,
      status: 'lobby'
    });

    await game.save();

    console.log(`✅ Game created: ${gameCode} by host: ${hostId}`);

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
    console.error('❌ Create game error:', error);
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
    console.error('❌ Get game error:', error);
    res.status(500).json({ error: error.message });
  }
};

// NEW: Start game function
export const startGame = async (req, res) => {
  try {
    const { gameCode } = req.params;
    const { hostId } = req.body;
    
    const game = await GameSession.findOne({ gameCode });
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Verify host
    if (game.hostId !== hostId) {
      return res.status(403).json({ error: 'Only the host can start the game' });
    }

    // Check minimum players
    if (game.players.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 players to start' });
    }

    // Update game status to clock
    game.status = 'clock';
    await game.save();

    console.log(`🎮 Game started: ${gameCode}`);

    // Notify all clients via Socket.IO
    const io = req.app.get('io');
    io.to(gameCode).emit('game-started', {
      gameCode: game.gameCode,
      status: game.status,
      message: 'Game is starting!'
    });

    res.json({ 
      success: true,
      game: {
        gameCode: game.gameCode,
        status: game.status
      }
    });
  } catch (error) {
    console.error('❌ Start game error:', error);
    res.status(500).json({ error: error.message });
  }
};


// NEW: Timer control functions
export const startTimer = async (req, res) => {
  try {
    const { gameCode } = req.params;
    const game = await GameSession.findOne({ gameCode });
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    game.timer.isRunning = true;
    await game.save();

    const io = req.app.get('io');
    io.to(gameCode).emit('timer-started', {
      timer: game.timer
    });

    console.log(`⏱️ Timer started: ${gameCode}`);

    res.json({ 
      success: true,
      timer: game.timer
    });
  } catch (error) {
    console.error('❌ Start timer error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const stopTimer = async (req, res) => {
  try {
    const { gameCode } = req.params;
    const game = await GameSession.findOne({ gameCode });
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    game.timer.isRunning = false;
    await game.save();

    const io = req.app.get('io');
    io.to(gameCode).emit('timer-stopped', {
      timer: game.timer
    });

    console.log(`⏸️ Timer stopped: ${gameCode}`);

    res.json({ 
      success: true,
      timer: game.timer
    });
  } catch (error) {
    console.error('❌ Stop timer error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const resetTimer = async (req, res) => {
  try {
    const { gameCode } = req.params;
    const game = await GameSession.findOne({ gameCode });
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    game.timer.value = game.settings.roundDuration;
    game.timer.isRunning = false;
    await game.save();

    const io = req.app.get('io');
    io.to(gameCode).emit('timer-reset', {
      timer: game.timer
    });

    console.log(`🔄 Timer reset: ${gameCode}`);

    res.json({ 
      success: true,
      timer: game.timer
    });
  } catch (error) {
    console.error('❌ Reset timer error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const timerEnded = async (req, res) => {
  try {
    const { gameCode } = req.params;
    const game = await GameSession.findOne({ gameCode });
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Update game state to board
    game.status = 'playing';
    game.timer.isRunning = false;
    game.timer.value = 0;
    await game.save();

    const io = req.app.get('io');
    io.to(gameCode).emit('timer-ended', {
      gameCode,
      status: 'playing',
      message: 'Time to answer!'
    });

    console.log(`⏰ Timer ended: ${gameCode} - Moving to board`);

    res.json({ 
      success: true,
      game: {
        gameCode: game.gameCode,
        status: game.status
      }
    });
  } catch (error) {
    console.error('❌ Timer ended error:', error);
    res.status(500).json({ error: error.message });
  }
};