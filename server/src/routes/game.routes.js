import express from 'express';
import { createGame, getGame, startGame } from '../controllers/game.controller.js';

const router = express.Router();

router.post('/', createGame);
router.get('/:gameCode', getGame);
router.post('/:gameCode/start', startGame); // NEW

export default router;