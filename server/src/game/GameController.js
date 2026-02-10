const gameState = require('./GameState');
const GameSession = require('../models/GameSession');
const timerManager = require('./TimerManager');
const questionHelpers = require('../utils/questionHelpers'); // ADD THIS LINE
const Question = require('../models/Question'); // ADD THIS TOO
const { 
  findMatchingAnswer, 
  calculatePoints 
} = require('../utils/questionValidator');
const { 
  getRandomQuestion, 
  getQuestionById,
  getFastMoneyQuestions 
} = require('../utils/questionHelpers');

class GameController {

  async loadQuestion(sessionId, questionId = null, multiplier = 1) {
    try {
      const session = gameState.getSession(sessionId);
      if (!session) {
        return { success: false, error: 'Session not found' };
      }

      let question;
      
      if (questionId) {
        // Load specific question by ID
        question = await Question.findOne({ questionId });
      } else {
        // Load random question
        const count = await Question.countDocuments();
        if (count === 0) {
          return { success: false, error: 'No questions in database' };
        }
        
        const random = Math.floor(Math.random() * count);
        question = await Question.findOne().skip(random);
      }

      if (!question) {
        return { success: false, error: 'Question not found' };
      }

      // Convert to plain object to ensure all data is included
      const questionData = question.toObject();
      
      console.log('✅ Question loaded:', questionData.text, `(${questionData.answers?.length} answers)`);

      // Start new round
      const round = gameState.startRound(sessionId, questionData, multiplier);

      return {
        success: true,
        question: questionData, // Full question with answers array
        round: {
          roundNumber: round.roundNumber,
          multiplier: round.multiplier
        }
      };
    } catch (error) {
      console.error('Load question error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new game session
   */
  async createGame(hostSocketId, settings = {}) {
    try {
      // Generate unique session ID
      const sessionId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create in-memory session
      const session = gameState.createSession(sessionId, hostSocketId, settings);

      // Persist to database
      const dbSession = new GameSession({
        sessionId,
        hostSocketId,
        settings: session.settings,
        status: 'waiting'
      });
      await dbSession.save();

      console.log(`✅ Game created: ${sessionId}`);

      return {
        success: true,
        sessionId,
        session
      };
    } catch (error) {
      console.error('❌ Error creating game:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Add a player to the game
   */
  async addPlayer(sessionId, playerData) {
    try {
      const session = gameState.getSession(sessionId);
      if (!session) {
        return {
          success: false,
          error: 'Game session not found'
        };
      }

      if (session.status !== 'waiting' && session.status !== 'active') {
        return {
          success: false,
          error: 'Game is not accepting players'
        };
      }

      // Check team balance (optional)
      const teamACount = gameState.getTeamPlayers(sessionId, 'A').length;
      const teamBCount = gameState.getTeamPlayers(sessionId, 'B').length;

      const player = gameState.addPlayer(sessionId, playerData);

      // Update database
      const dbSession = await GameSession.findOne({ sessionId });
      if (dbSession) {
        await dbSession.addPlayer(playerData.name, playerData.team, playerData.socketId);
      }

      console.log(`✅ Player added: ${player.name} (Team ${player.team})`);

      return {
        success: true,
        player,
        teamCount: {
          A: teamACount + (playerData.team === 'A' ? 1 : 0),
          B: teamBCount + (playerData.team === 'B' ? 1 : 0)
        }
      };
    } catch (error) {
      console.error('❌ Error adding player:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start the game
   */
  async startGame(sessionId) {
    try {
      const session = gameState.getSession(sessionId);
      if (!session) {
        return {
          success: false,
          error: 'Game session not found'
        };
      }

      if (session.players.length === 0) {
        return {
          success: false,
          error: 'No players in the game'
        };
      }

      gameState.setStatus(sessionId, 'active');

      // Update database
      const dbSession = await GameSession.findOne({ sessionId });
      if (dbSession) {
        dbSession.status = 'active';
        await dbSession.save();
      }

      console.log(`✅ Game started: ${sessionId}`);

      return {
        success: true,
        session
      };
    } catch (error) {
      console.error('❌ Error starting game:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load a new question for the round
   */
  async loadQuestion(sessionId, questionId = null, multiplier = 1) {
  try {
    const session = gameState.getSession(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    let question;
    
    if (questionId) {
      // Load specific question
      question = await questionHelpers.getQuestionById(questionId);
    } else {
      // Load random question
      question = await questionHelpers.getRandomQuestion();
    }

    if (!question) {
      return { success: false, error: 'No questions available' };
    }

    // IMPORTANT: Convert to plain object and ensure answers are included
    const questionData = question.toObject ? question.toObject() : question;
    
    console.log('Question loaded with answers:', {
      id: questionData.questionId,
      text: questionData.text,
      answersCount: questionData.answers?.length
    });

    // Start new round
    const round = gameState.startRound(sessionId, questionData, multiplier);

    return {
      success: true,
      question: questionData, // Send full question with answers
      round: {
        roundNumber: round.roundNumber,
        multiplier: round.multiplier
      }
    };
  } catch (error) {
    console.error('Load question error:', error);
    return { success: false, error: error.message };
  }
}

  /**
   * Submit an answer
   */
  async submitAnswer(sessionId, submittedAnswer, strictMode = false) {
    try {
      const session = gameState.getSession(sessionId);
      if (!session) {
        return {
          success: false,
          error: 'Game session not found'
        };
      }

      const question = session.currentQuestion;
      if (!question) {
        return {
          success: false,
          error: 'No active question'
        };
      }

      // Check if answer already revealed
      const alreadyRevealed = session.revealedAnswers.find(
        ra => ra.text.toLowerCase() === submittedAnswer.toLowerCase()
      );

      if (alreadyRevealed) {
        return {
          success: false,
          error: 'Answer already revealed',
          duplicate: true
        };
      }

      // Find matching answer
      const matchedAnswer = findMatchingAnswer(
        submittedAnswer,
        question.answers,
        strictMode
      );

      if (!matchedAnswer) {
        // Wrong answer - add strike
        const strikes = gameState.addStrike(sessionId);

        console.log(`❌ Wrong answer: "${submittedAnswer}" (Strikes: ${strikes})`);

        return {
          success: false,
          correct: false,
          strikes,
          maxStrikes: session.settings.maxStrikes,
          strikeOut: strikes >= session.settings.maxStrikes
        };
      }

      // Correct answer - reveal and award points
      const currentRound = gameState.getCurrentRound(sessionId);
      const points = calculatePoints(matchedAnswer.frequency, currentRound.multiplier);

      gameState.revealAnswer(sessionId, matchedAnswer, points);
      const scores = gameState.awardPoints(sessionId, session.activeTeam, points);

      console.log(`✅ Correct answer: "${matchedAnswer.text}" (+${points} points to Team ${session.activeTeam})`);

      return {
        success: true,
        correct: true,
        answer: {
          text: matchedAnswer.text,
          frequency: matchedAnswer.frequency,
          points
        },
        scores,
        revealedCount: session.revealedAnswers.length,
        totalAnswers: question.answers.length
      };
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Switch to the other team
   */
  switchTeam(sessionId) {
    try {
      const session = gameState.getSession(sessionId);
      if (!session) {
        return {
          success: false,
          error: 'Game session not found'
        };
      }

      const newTeam = gameState.switchTeam(sessionId);

      console.log(`🔄 Switched to Team ${newTeam}`);

      return {
        success: true,
        activeTeam: newTeam
      };
    } catch (error) {
      console.error('❌ Error switching team:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Complete the current round
   */
  async completeRound(sessionId) {
    try {
      const session = gameState.getSession(sessionId);
      if (!session) {
        return {
          success: false,
          error: 'Game session not found'
        };
      }

      const round = gameState.completeRound(sessionId);

      console.log(`✅ Round ${round.roundNumber} completed`);

      return {
        success: true,
        round,
        scores: {
          teamA: session.teamAScore,
          teamB: session.teamBScore
        }
      };
    } catch (error) {
      console.error('❌ Error completing round:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start Fast Money round
   */
  async startFastMoney(sessionId) {
    try {
      const session = gameState.getSession(sessionId);
      if (!session) {
        return {
          success: false,
          error: 'Game session not found'
        };
      }

      // Get 5 Fast Money questions
      const questions = await getFastMoneyQuestions(5);

      if (questions.length < 5) {
        return {
          success: false,
          error: 'Not enough Fast Money questions available'
        };
      }

      session.gameMode = 'fastMoney';
      session.fastMoneyQuestions = questions;
      session.fastMoneyAnswers = {
        player1: [],
        player2: []
      };

      console.log(`⚡ Fast Money started`);

      return {
        success: true,
        questions: questions.map(q => ({
          questionId: q.questionId,
          text: q.text
        }))
      };
    } catch (error) {
      console.error('❌ Error starting Fast Money:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Submit Fast Money answer
   */
  submitFastMoneyAnswer(sessionId, playerNumber, questionIndex, answer) {
    try {
      const session = gameState.getSession(sessionId);
      if (!session || session.gameMode !== 'fastMoney') {
        return {
          success: false,
          error: 'Not in Fast Money mode'
        };
      }

      const question = session.fastMoneyQuestions[questionIndex];
      if (!question) {
        return {
          success: false,
          error: 'Invalid question index'
        };
      }

      // Find matching answer
      const matchedAnswer = findMatchingAnswer(answer, question.answers, false);
      const points = matchedAnswer ? matchedAnswer.frequency : 0;

      const answerData = {
        questionIndex,
        submittedAnswer: answer,
        matchedAnswer: matchedAnswer ? matchedAnswer.text : null,
        points
      };

      const playerKey = `player${playerNumber}`;
      session.fastMoneyAnswers[playerKey].push(answerData);

      return {
        success: true,
        answer: answerData,
        totalQuestions: 5,
        answeredCount: session.fastMoneyAnswers[playerKey].length
      };
    } catch (error) {
      console.error('❌ Error submitting Fast Money answer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate Fast Money results
   */
  calculateFastMoneyResults(sessionId) {
    try {
      const session = gameState.getSession(sessionId);
      if (!session || session.gameMode !== 'fastMoney') {
        return {
          success: false,
          error: 'Not in Fast Money mode'
        };
      }

      const player1Total = session.fastMoneyAnswers.player1.reduce(
        (sum, a) => sum + a.points, 0
      );
      const player2Total = session.fastMoneyAnswers.player2.reduce(
        (sum, a) => sum + a.points, 0
      );

      const combinedTotal = player1Total + player2Total;
      const targetReached = combinedTotal >= parseInt(process.env.FAST_MONEY_TARGET || 100);
      const bonus = targetReached ? parseInt(process.env.FAST_MONEY_BONUS || 500) : 0;

      // Award bonus to leading team
      if (bonus > 0) {
        const leadingTeam = session.teamAScore >= session.teamBScore ? 'A' : 'B';
        gameState.awardPoints(sessionId, leadingTeam, bonus);
      }

      console.log(`⚡ Fast Money Results: ${player1Total} + ${player2Total} = ${combinedTotal}${targetReached ? ' +' + bonus + ' BONUS!' : ''}`);

      return {
        success: true,
        player1Total,
        player2Total,
        combinedTotal,
        targetReached,
        bonus,
        finalScores: {
          teamA: session.teamAScore,
          teamB: session.teamBScore
        }
      };
    } catch (error) {
      console.error('❌ Error calculating Fast Money results:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * End the game
   */
  async endGame(sessionId) {
    try {
      const session = gameState.getSession(sessionId);
      if (!session) {
        return {
          success: false,
          error: 'Game session not found'
        };
      }

      gameState.setStatus(sessionId, 'completed');

      // Determine winner
      const winner = session.teamAScore > session.teamBScore ? 'A' : 
                     session.teamBScore > session.teamAScore ? 'B' : 'TIE';

      // Update database
      const dbSession = await GameSession.findOne({ sessionId });
      if (dbSession) {
        dbSession.status = 'completed';
        dbSession.completedAt = new Date();
        dbSession.teamAScore = session.teamAScore;
        dbSession.teamBScore = session.teamBScore;
        await dbSession.save();
      }

      console.log(`🏁 Game ended: ${sessionId} (Winner: Team ${winner})`);

      return {
        success: true,
        winner,
        finalScores: {
          teamA: session.teamAScore,
          teamB: session.teamBScore
        },
        totalRounds: session.rounds.length
      };
    } catch (error) {
      console.error('❌ Error ending game:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current game state
   */
  getGameState(sessionId) {
    const session = gameState.getSession(sessionId);
    if (!session) {
      return null;
    }

    return {
      sessionId: session.sessionId,
      status: session.status,
      gameMode: session.gameMode,
      players: session.players,
      scores: {
        teamA: session.teamAScore,
        teamB: session.teamBScore
      },
      currentRound: session.currentRound,
      activeTeam: session.activeTeam,
      strikes: session.strikes,
      maxStrikes: session.settings.maxStrikes,
      revealedAnswers: session.revealedAnswers,
      timer: {
        remaining: session.timerRemaining,
        active: session.timerActive
      }
    };
  }

  /**
   * Clean up on disconnect
   */
  handleDisconnect(socketId) {
    gameState.cleanupSocket(socketId);
  }
}

// Singleton instance
const gameController = new GameController();

module.exports = gameController;