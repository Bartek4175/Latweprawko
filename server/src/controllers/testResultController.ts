import { Request, Response } from 'express';
import TestResult from '../models/TestResult';
import Question from '../models/Question';

export const saveTestResult = async (req: Request, res: Response) => {
  const { userId, answers } = req.body;

  try {
    // Oblicz wynik testu
    let score = 0;
    const detailedAnswers = await Promise.all(answers.map(async (answer: { questionId: string, answer: string }) => {
      const question = await Question.findById(answer.questionId);
      if (question) {
        const correctAnswer = question.answers.find(a => a.isCorrect)?.option;
        const correct = correctAnswer === answer.answer;
        if (correct) score += question.points;
        return { ...answer, correct };
      }
      return null;
    }));

    console.log('Detailed Answers:', detailedAnswers);

    const filteredAnswers = detailedAnswers.filter(answer => answer !== null);

    console.log('Filtered Answers:', filteredAnswers);

    // Zapisz wynik testu
    const testResult = new TestResult({
      userId,
      score,
      answers: filteredAnswers,
    });

    console.log('Test Result Object:', testResult);

    await testResult.save();
    res.status(201).json({ message: 'Wynik testu zapisany pomyślnie', testResult });
  } catch (error) {
    console.error('Błąd podczas zapisu wyniku testu:', error); // Log błędu
    res.status(500).json({ message: 'Błąd serwera', error });
  }
};


export const getUserStats = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const testResults = await TestResult.find({ userId }).sort({ date: -1 });
    res.status(200).json(testResults);
  } catch (error) {
    console.error('Błąd podczas pobierania statystyk:', error);
    res.status(500).json({ message: 'Błąd serwera', error });
  }
};
