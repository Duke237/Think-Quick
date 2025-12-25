const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/gameController');

router.post('/', ctrl.createGame);
router.post('/join', ctrl.joinGame);
router.get('/code/:code', ctrl.getGameByCode);
router.get('/:id', ctrl.getGame);
router.post('/start-round', ctrl.startRound); // { gameId, questionId }
// host control endpoints
router.post('/:gameId/strike', ctrl.addStrike);
router.post('/:gameId/pass', ctrl.passTurn);
router.post('/:gameId/reveal', ctrl.revealAnswerManual);
// timer controls
router.post('/:gameId/timer/start', ctrl.timerStart);
router.post('/:gameId/timer/pause', ctrl.timerPause);
router.post('/:gameId/timer/reset', ctrl.timerReset);
router.get('/:gameId/timer', ctrl.timerStatus);
router.post('/:gameId/answer', ctrl.submitAnswer); // body: { teamIndex, answer }
router.post('/:gameId/players/:playerId/team', ctrl.changePlayerTeam);
router.post('/:gameId/start', ctrl.startGame);
router.post('/:gameId/fast-money/start', ctrl.startFastMoney);
router.get('/:gameId/fast-money/questions', ctrl.getFastMoneyQuestions);
router.post('/:gameId/fast-money/submit', ctrl.submitFastMoney); // { playerIndex, answers: [{questionId, answer}] }

module.exports = router;