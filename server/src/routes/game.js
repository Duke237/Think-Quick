const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/gameController');

router.post('/', ctrl.createGame);
router.get('/:id', ctrl.getGame);
router.post('/start-round', ctrl.startRound); // { gameId, questionId }
router.post('/:gameId/answer', ctrl.submitAnswer); // body: { teamIndex, answer }
router.post('/:gameId/fast-money/start', ctrl.startFastMoney);
router.post('/:gameId/fast-money/submit', ctrl.submitFastMoney); // { playerIndex, answers: [{questionId, answer}] }

module.exports = router;