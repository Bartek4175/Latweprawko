import express from 'express';
import { getQuestions, getRandomQuestion, getQuestionExplanation } from '../controllers/questionController';

const router = express.Router();

router.get('/', getQuestions);
router.get('/random-question', getRandomQuestion);
router.get('/:questionId/explanation', getQuestionExplanation);

export default router;
