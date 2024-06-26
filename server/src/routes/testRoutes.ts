import express from 'express';
import { getExamQuestions } from '../controllers/testController';

const router = express.Router();

router.get('/exam-questions', getExamQuestions);

export default router;
