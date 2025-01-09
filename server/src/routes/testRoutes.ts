import express from 'express';
import { getExamQuestions } from '../controllers/testController';
import { getOptimizedExamQuestions } from '../controllers/testController';

const router = express.Router();

router.get('/exam-questions', getExamQuestions);

router.get('/optimized-exam-questions/:userId', getOptimizedExamQuestions);

export default router;
