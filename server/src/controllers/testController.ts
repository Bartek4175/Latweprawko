import { Request, Response } from 'express';
import Question from '../models/Question';
import TestResult from '../models/TestResult';
import mongoose from 'mongoose';

const getExamQuestions = async (req: Request, res: Response) => {
  try {
    const allQuestions = await Question.find();

    const basicQuestions = allQuestions.filter(q =>
      q.category.split(',').includes('B') && q.type === 'podstawowe'
    );

    const specialistQuestions = allQuestions.filter(q =>
      q.category.split(',').includes('B') && q.type === 'specjalistyczne'
    );

    const selectedBasicQuestions = [
      ...basicQuestions.filter(q => q.points === 3).sort(() => 0.5 - Math.random()).slice(0, 10),
      ...basicQuestions.filter(q => q.points === 2).sort(() => 0.5 - Math.random()).slice(0, 6),
      ...basicQuestions.filter(q => q.points === 1).sort(() => 0.5 - Math.random()).slice(0, 4),
    ];

    const selectedSpecialistQuestions = [
      ...specialistQuestions.filter(q => q.points === 3).sort(() => 0.5 - Math.random()).slice(0, 6),
      ...specialistQuestions.filter(q => q.points === 2).sort(() => 0.5 - Math.random()).slice(0, 4),
      ...specialistQuestions.filter(q => q.points === 1).sort(() => 0.5 - Math.random()).slice(0, 2),
    ];

    const examQuestions = [...selectedBasicQuestions, ...selectedSpecialistQuestions];

    if (examQuestions.length !== 32) {
      console.error('Nieprawidłowa liczba pytań:', examQuestions.length);
      return res.status(500).json({ error: 'Nieprawidłowe dane pytań.' });
    }

    res.json(examQuestions);
  } catch (error) {
    console.error('Błąd serwera:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Endpoint zapisujący czasy odpowiedzi
const saveAnswerTimes = async (req: Request, res: Response) => {
  try {
    const { userId, answers } = req.body;

    const testResult = new TestResult({
      userId,
      answers: answers.map((answer: any) => ({
        questionId: answer.questionId,
        answer: answer.answer,
        correct: answer.correct,
        timeSpent: answer.timeSpent,
      })),
    });

    await testResult.save();

    res.status(201).json({ message: 'Wyniki zapisane pomyślnie' });
  } catch (error) {
    console.error('Błąd podczas zapisu wyników:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Pobieranie zoptymalizowanych pytań na podstawie wyników użytkownika
const getOptimizedExamQuestions = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const testResults = await TestResult.find({ userId });

    // Tworzymy mapę statystyk odpowiedzi użytkownika
    const questionPerformance = new Map<string, { correctCount: number; fastCorrectCount: number }>();

    testResults.forEach(result => {
      result.answers.forEach(answer => {
        const { questionId, correct, timeSpent } = answer;
        if (!questionPerformance.has(questionId.toString())) {
          questionPerformance.set(questionId.toString(), { correctCount: 0, fastCorrectCount: 0 });
        }

        const performance = questionPerformance.get(questionId.toString())!;
        if (correct) {
          performance.correctCount++;
          if (timeSpent <= 3) {
            performance.fastCorrectCount++;
          }
        }
      });
    });

    const allQuestions = await Question.find();

    const availableQuestions = allQuestions.filter((question) => {
      const performance = questionPerformance.get((question._id as mongoose.Types.ObjectId).toString());
      if (performance && performance.correctCount >= 2 && performance.fastCorrectCount >= 2) {
        return false;
      }
      return true;
    });
    
    

    const selectedQuestions = availableQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, 32);

    res.status(200).json(selectedQuestions);
  } catch (error) {
    console.error('Błąd serwera:', error);
    res.status(500).json({ message: 'Błąd serwera', error });
  }
};

export { getExamQuestions, saveAnswerTimes, getOptimizedExamQuestions };