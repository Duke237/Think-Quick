import express from 'express';
import { createGame, getGame } from '../controllers/game.controller.js';

const router = express.Router();

router.post('/', createGame);
router.get('/:gameCode', getGame);

export default router;