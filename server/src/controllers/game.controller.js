import GameSession from '../models/GameSession.js';
import Question from '../models/Question.js';

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


// NEW: Load question for board
export const loadQuestion = async (req, res) => {
  try {
    const { gameCode } = req.params;
    const game = await GameSession.findOne({ gameCode });
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Get random question
    const questions = await Question.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 1 } }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions available' });
    }

    const question = questions[0];

    // Update game with question
    game.currentQuestion = question._id;
    game.revealedAnswers = [];
    game.strikes = 0;
    game.status = 'playing';
    await game.save();

    const populatedGame = await GameSession.findOne({ gameCode })
      .populate('currentQuestion');

    // Notify all clients
    const io = req.app.get('io');
    io.to(gameCode).emit('question-loaded', {
      question: populatedGame.currentQuestion
    });

    console.log(`📝 Question loaded: ${gameCode}`);

    res.json({
      success: true,
      game: populatedGame
    });
  } catch (error) {
    console.error('❌ Load question error:', error);
    res.status(500).json({ error: error.message });
  }
};

// NEW: Submit and validate answer
export const submitAnswer = async (req, res) => {
  try {
    const { gameCode } = req.params;
    const { answer, teamId } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ error: 'Answer is required' });
    }

    const game = await GameSession.findOne({ gameCode })
      .populate('currentQuestion');
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (!game.currentQuestion) {
      return res.status(400).json({ error: 'No active question' });
    }

    // Normalize answer
    const normalizedAnswer = answer.toLowerCase().trim();
    
    // Find matching answer
    const matchedAnswer = game.currentQuestion.answers.find(ans => {
      const isNotRevealed = !game.revealedAnswers.some(ra => ra.text === ans.text);
      const isMatch = ans.text.toLowerCase().includes(normalizedAnswer) || 
                      normalizedAnswer.includes(ans.text.toLowerCase());
      return isNotRevealed && isMatch;
    });

    const io = req.app.get('io');

    if (matchedAnswer) {
      // CORRECT ANSWER
      game.revealedAnswers.push({
        text: matchedAnswer.text,
        frequency: matchedAnswer.frequency,
        revealedAt: new Date()
      });

      // Calculate points: frequency × round multiplier
      const points = matchedAnswer.frequency * game.getRoundMultiplier();

      // Award points to team
      game.awardPoints(teamId, matchedAnswer.frequency);
      await game.save();

      console.log(`✅ Correct answer: ${matchedAnswer.text} (+${points} points)`);

      // Notify all clients
      io.to(gameCode).emit('answer-correct', {
        answer: matchedAnswer,
        points,
        teamId,
        revealedAnswers: game.revealedAnswers,
        teams: game.teams
      });

      // Check if all answers revealed
      if (game.revealedAnswers.length >= game.currentQuestion.answers.length) {
        setTimeout(async () => {
          game.status = 'round-end';
          await game.save();
          io.to(gameCode).emit('round-complete', { game });
        }, 2000);
      }

      res.json({
        success: true,
        correct: true,
        answer: matchedAnswer,
        points,
        game
      });
    } else {
      // WRONG ANSWER
      game.strikes += 1;
      const maxStrikes = game.settings.maxStrikes;
      await game.save();

      console.log(`❌ Wrong answer: ${answer} (Strike ${game.strikes}/${maxStrikes})`);

      // Notify all clients
      io.to(gameCode).emit('answer-wrong', {
        strikes: game.strikes,
        maxStrikes
      });

      // Check if max strikes reached
      if (game.strikes >= maxStrikes) {
        game.currentTeamIndex = (game.currentTeamIndex + 1) % game.teams.length;
        game.strikes = 0;
        await game.save();

        io.to(gameCode).emit('team-switched', {
          currentTeam: game.teams[game.currentTeamIndex]
        });
      }

      res.json({
        success: true,
        correct: false,
        strikes: game.strikes,
        maxStrikes
      });
    }
  } catch (error) {
    console.error('❌ Submit answer error:', error);
    res.status(500).json({ error: error.message });
  }
};

// NEW: Next question
export const nextQuestion = async (req, res) => {
  try {
    const { gameCode } = req.params;
    const game = await GameSession.findOne({ gameCode });
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if game is over
    if (game.currentRound >= 3) {
      game.status = 'game-over';
      await game.save();

      const io = req.app.get('io');
      io.to(gameCode).emit('game-over', { game });

      return res.json({
        success: true,
        gameOver: true,
        game
      });
    }

    // Move to next round
    game.currentRound += 1;
    game.status = 'clock';
    game.strikes = 0;
    game.revealedAnswers = [];
    game.timer.value = game.settings.roundDuration;
    game.timer.isRunning = false;
    await game.save();

    const io = req.app.get('io');
    io.to(gameCode).emit('next-round', {
      round: game.currentRound,
      status: 'clock'
    });

    console.log(`➡️ Moving to round ${game.currentRound}: ${gameCode}`);

    res.json({
      success: true,
      game
    });
  } catch (error) {
    console.error('❌ Next question error:', error);
    res.status(500).json({ error: error.message });
  }
};