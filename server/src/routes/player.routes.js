import express from 'express';
import { registerPlayer, getPlayers } from '../controllers/player.controller.js';

const router = express.Router();

router.post('/:gameCode', registerPlayer);
router.get('/:gameCode', getPlayers);

export default router;