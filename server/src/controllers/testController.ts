import { Request, Response } from 'express';
import Question from '../models/Question';
import TestResult from '../models/TestResult';
import mongoose from 'mongoose';

const getExamQuestions = async (req: Request, res: Response) => {
  try {
    const { category = 'B' } = req.query;

    const allQuestions = await Question.find();

    const basicQuestions = allQuestions.filter(q =>
      q.category.split(',').includes(category as string) && q.type === 'podstawowe'
    );

    const specialistQuestions = allQuestions.filter(q =>
      q.category.split(',').includes(category as string) && q.type === 'specjalistyczne'
    );

    const selectedBasicQuestions = [
      ...basicQuestions.filter(q => q.points === 3).slice(0, 10),
      ...basicQuestions.filter(q => q.points === 2).slice(0, 6),
      ...basicQuestions.filter(q => q.points === 1).slice(0, 4),
    ];

    const selectedSpecialistQuestions = [
      ...specialistQuestions.filter(q => q.points === 3).slice(0, 6),
      ...specialistQuestions.filter(q => q.points === 2).slice(0, 4),
      ...specialistQuestions.filter(q => q.points === 1).slice(0, 2),
    ];

    const shuffledBasicQuestions = selectedBasicQuestions.sort(() => Math.random() - 0.5);
    const shuffledSpecialistQuestions = selectedSpecialistQuestions.sort(() => Math.random() - 0.5);

    const examQuestions = [...shuffledBasicQuestions, ...shuffledSpecialistQuestions];

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

const getOptimizedExamQuestions = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { category = 'B' } = req.query;

  try {
    const testResults = await TestResult.find({ userId });
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
    const basicQuestions = allQuestions.filter(q =>
      q.category.split(',').includes(category as string) && q.type === 'podstawowe'
    );
    const specialistQuestions = allQuestions.filter(q =>
      q.category.split(',').includes(category as string) && q.type === 'specjalistyczne'
    );

    const filteredBasicQuestions = basicQuestions.filter((question) => {
      const performance = questionPerformance.get((question._id as mongoose.Types.ObjectId).toString());
      if (performance && performance.correctCount >= 2 && performance.fastCorrectCount >= 2) {
        return false;
      }
      return true;
    });

    const filteredSpecialistQuestions = specialistQuestions.filter((question) => {
      const performance = questionPerformance.get((question._id as mongoose.Types.ObjectId).toString());
      if (performance && performance.correctCount >= 2 && performance.fastCorrectCount >= 2) {
        return false;
      }
      return true;
    });

    const selectedBasicQuestions = [
      ...filteredBasicQuestions.filter(q => q.points === 3).slice(0, 10),
      ...filteredBasicQuestions.filter(q => q.points === 2).slice(0, 6),
      ...filteredBasicQuestions.filter(q => q.points === 1).slice(0, 4),
    ];

    const selectedSpecialistQuestions = [
      ...filteredSpecialistQuestions.filter(q => q.points === 3).slice(0, 6),
      ...filteredSpecialistQuestions.filter(q => q.points === 2).slice(0, 4),
      ...filteredSpecialistQuestions.filter(q => q.points === 1).slice(0, 2),
    ];

    const shuffledBasicQuestions = selectedBasicQuestions.sort(() => Math.random() - 0.5);
    const shuffledSpecialistQuestions = selectedSpecialistQuestions.sort(() => Math.random() - 0.5);

    const examQuestions = [...shuffledBasicQuestions, ...shuffledSpecialistQuestions];

    if (examQuestions.length !== 32) {
      console.error('Nieprawidłowa liczba pytań:', examQuestions.length);
      return res.status(500).json({ error: 'Nieprawidłowe dane pytań.' });
    }

    res.status(200).json(examQuestions);
  } catch (error) {
    console.error('Błąd serwera:', error);
    res.status(500).json({ message: 'Błąd serwera', error });
  }
};

const getLimitedExamQuestions = async (req: Request, res: Response) => {
  try {
    // Pobierz 100 pytań z kategorii B
    const limitedQuestions = await Question.find({ category: 'B' })
      .sort({ _id: 1 }) // Stałe sortowanie po _id (rosnąco)
      .limit(100); // Ograniczenie do 100 pytań

    if (!limitedQuestions.length) {
      return res.status(404).json({ message: 'Brak pytań w ograniczonej bazie.' });
    }

    // Podziel pytania na podstawowe i specjalistyczne
    const basicQuestions = limitedQuestions.filter((q) => q.type === 'podstawowe');
    const specialistQuestions = limitedQuestions.filter((q) => q.type === 'specjalistyczne');

    // Upewnij się, że mamy wystarczającą liczbę pytań
    if (basicQuestions.length < 20 || specialistQuestions.length < 12) {
      return res.status(500).json({ message: 'Nieprawidłowa liczba pytań w ograniczonej bazie.' });
    }

    // Wybierz pytania podstawowe według punktacji
    const selectedBasicQuestions = [
      ...basicQuestions.filter((q) => q.points === 3).slice(0, 10),
      ...basicQuestions.filter((q) => q.points === 2).slice(0, 6),
      ...basicQuestions.filter((q) => q.points === 1).slice(0, 4),
    ];

    // Wybierz pytania specjalistyczne według punktacji
    const selectedSpecialistQuestions = [
      ...specialistQuestions.filter((q) => q.points === 3).slice(0, 6),
      ...specialistQuestions.filter((q) => q.points === 2).slice(0, 4),
      ...specialistQuestions.filter((q) => q.points === 1).slice(0, 2),
    ];

    // Losowo przetasuj pytania
    const shuffledBasicQuestions = selectedBasicQuestions.sort(() => Math.random() - 0.5);
    const shuffledSpecialistQuestions = selectedSpecialistQuestions.sort(() => Math.random() - 0.5);

    // Połącz pytania w zestaw egzaminacyjny
    const examQuestions = [...shuffledBasicQuestions, ...shuffledSpecialistQuestions];

    // Sprawdź, czy mamy dokładnie 32 pytania (20 podstawowych + 12 specjalistycznych)
    if (examQuestions.length !== 32) {
      console.error('Nieprawidłowa liczba pytań:', examQuestions.length);
      return res.status(500).json({ message: 'Nieprawidłowe dane pytań.' });
    }

    res.status(200).json(examQuestions);
  } catch (error) {
    console.error('Błąd podczas pobierania ograniczonej bazy pytań:', error);
    res.status(500).json({ message: 'Błąd serwera.' });
  }
};



export { getExamQuestions, saveAnswerTimes, getOptimizedExamQuestions, getLimitedExamQuestions };
