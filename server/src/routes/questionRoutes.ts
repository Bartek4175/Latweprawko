import express from 'express';
import { getQuestions, getRandomQuestion, getQuestionExplanation, updateUserProgress, getTotalQuestionsInCategory, getCompletedQuestions} from '../controllers/questionController';

const router = express.Router();

router.get('/', getQuestions);
router.get('/random-question', getRandomQuestion);
router.get('/:questionId/explanation', getQuestionExplanation);
router.post('/update-progress', updateUserProgress);
router.get('/total-questions', getTotalQuestionsInCategory);
router.get('/completed-questions', getCompletedQuestions);

export default router;
