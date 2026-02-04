const express = require('express');
const router = express.Router();
const GameSession = require('../models/GameSession');
const gameController = require('../game/GameController');

/**
 * @route   GET /api/games
 * @desc    Get all game sessions
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sessions = await GameSession.find(filter)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await GameSession.countDocuments(filter);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching game sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/games/:sessionId
 * @desc    Get a specific game session
 * @access  Public
 */
router.get('/:sessionId', async (req, res) => {
  try {
    const session = await GameSession.findOne({ 
      sessionId: req.params.sessionId 
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error fetching game session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/games/:sessionId/state
 * @desc    Get current game state (from memory)
 * @access  Public
 */
router.get('/:sessionId/state', (req, res) => {
  try {
    const state = gameController.getGameState(req.params.sessionId);

    if (!state) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found or not active'
      });
    }

    res.json({
      success: true,
      data: state
    });
  } catch (error) {
    console.error('Error fetching game state:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/games/:sessionId/players
 * @desc    Get players in a game
 * @access  Public
 */
router.get('/:sessionId/players', async (req, res) => {
  try {
    const session = await GameSession.findOne({ 
      sessionId: req.params.sessionId 
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }

    res.json({
      success: true,
      data: {
        players: session.players,
        teamA: session.players.filter(p => p.team === 'A'),
        teamB: session.players.filter(p => p.team === 'B')
      }
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/games/:sessionId/rounds
 * @desc    Get rounds for a game
 * @access  Public
 */
router.get('/:sessionId/rounds', async (req, res) => {
  try {
    const session = await GameSession.findOne({ 
      sessionId: req.params.sessionId 
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }

    res.json({
      success: true,
      data: {
        rounds: session.rounds,
        currentRound: session.currentRound,
        totalRounds: session.rounds.length
      }
    });
  } catch (error) {
    console.error('Error fetching rounds:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/games/:sessionId
 * @desc    Delete a game session
 * @access  Admin
 */
router.delete('/:sessionId', async (req, res) => {
  try {
    const session = await GameSession.findOneAndDelete({ 
      sessionId: req.params.sessionId 
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }

    console.log(`🗑️  Game session deleted: ${session.sessionId}`);

    res.json({
      success: true,
      message: 'Game session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting game session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/games/stats/summary
 * @desc    Get game statistics
 * @access  Public
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const totalGames = await GameSession.countDocuments();
    const activeGames = await GameSession.countDocuments({ status: 'active' });
    const completedGames = await GameSession.countDocuments({ status: 'completed' });

    const avgPlayersPerGame = await GameSession.aggregate([
      {
        $project: {
          playerCount: { $size: '$players' }
        }
      },
      {
        $group: {
          _id: null,
          avgPlayers: { $avg: '$playerCount' }
        }
      }
    ]);

    const avgRoundsPerGame = await GameSession.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $project: {
          roundCount: { $size: '$rounds' }
        }
      },
      {
        $group: {
          _id: null,
          avgRounds: { $avg: '$roundCount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalGames,
        activeGames,
        completedGames,
        avgPlayers: avgPlayersPerGame[0]?.avgPlayers || 0,
        avgRounds: avgRoundsPerGame[0]?.avgRounds || 0
      }
    });
  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;