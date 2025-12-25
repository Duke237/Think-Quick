import express from 'express';
import { 
  createGame, 
  getGame, 
  addPlayer, 
  startGame 
} from '../controllers/game.controller.js';

const router = express.Router();

router.post('/', createGame);
router.get('/:gameCode', getGame);
router.post('/:gameCode/players', addPlayer);
router.post('/:gameCode/start', startGame);

export default router;