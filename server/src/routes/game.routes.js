import express from 'express';
import { 
  createGame, 
  getGame, 
  startGame,
  startTimer,
  stopTimer,
  resetTimer,
  timerEnded,
  loadQuestion,
  submitAnswer,
  nextQuestion
} from '../controllers/game.controller.js';

const router = express.Router();

router.post('/', createGame);
router.get('/:gameCode', getGame);
router.post('/:gameCode/start', startGame);

// Timer routes
router.post('/:gameCode/timer/start', startTimer);
router.post('/:gameCode/timer/stop', stopTimer);
router.post('/:gameCode/timer/reset', resetTimer);
router.post('/:gameCode/timer/ended', timerEnded);

// Board routes
router.post('/:gameCode/question/load', loadQuestion);
router.post('/:gameCode/answer/submit', submitAnswer);
router.post('/:gameCode/next', nextQuestion);

export default router;