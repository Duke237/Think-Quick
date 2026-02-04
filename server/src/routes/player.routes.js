const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/players/stats/:playerId
 * @desc    Get player statistics (future feature)
 * @access  Public
 */
router.get('/stats/:playerId', (req, res) => {
  res.json({
    success: true,
    message: 'Player statistics - Coming soon',
    playerId: req.params.playerId
  });
});

/**
 * @route   GET /api/players/leaderboard
 * @desc    Get leaderboard (future feature)
 * @access  Public
 */
router.get('/leaderboard', (req, res) => {
  res.json({
    success: true,
    message: 'Leaderboard - Coming soon',
    data: []
  });
});

module.exports = router;