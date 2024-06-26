import express from 'express';
import { saveTestResult, getUserStats } from '../controllers/testResultController';

const router = express.Router();

router.post('/save', saveTestResult);
router.get('/stats/:userId', getUserStats);

export default router;
