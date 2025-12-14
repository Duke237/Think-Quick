const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Define API routes
router.get('/stats', statsController.getStats);
router.post('/stats', statsController.createStat);
router.put('/stats/:id', statsController.updateStat);
router.delete('/stats/:id', statsController.deleteStat);

module.exports = router;