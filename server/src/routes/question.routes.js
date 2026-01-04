import express from 'express';
import { getRandomQuestion, createQuestion, seedQuestions } from '../controllers/question.controller.js';

const router = express.Router();

router.get('/random', getRandomQuestion);
router.post('/', createQuestion);
router.post('/seed', seedQuestions);

export default router;