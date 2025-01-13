import { Request, Response } from 'express';
import Question from '../models/Question';
import UserProgress from '../models/UserProgress';

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRandomQuestion = async (req: Request, res: Response) => {
  try {
    const { type, category, userId } = req.query;

    if (!userId || !category) {
      return res.status(400).json({ message: 'Brak wymaganych parametrów: userId lub category' });
    }

    const query: { type?: string; category?: string; _id?: object } = {
      category: category as string,
    };

    if (type && type !== 'losowe') {
      query.type = type as string;
    }

    const completedQuestions = await UserProgress.find({
      userId,
      category,
      isReviewed: true,
    }).distinct('questionId');

    query._id = { $nin: completedQuestions };

    const count = await Question.countDocuments(query);
    if (count === 0) {
      return res.status(404).json({ message: 'Brak pytań do wyświetlenia' });
    }

    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne(query).skip(random);

    res.json(question);
  } catch (error) {
    console.error('Błąd serwera:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

export const getQuestionExplanation = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);

    if (question) {
      res.json({
        explanation: "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
      });
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserProgress = async (req: Request, res: Response) => {
  try {
    const { userId, questionId, category, isReviewed } = req.body;

    let progress = await UserProgress.findOne({ userId, questionId, category });

    if (progress) {
      progress.isReviewed = isReviewed;
      await progress.save();
    } else {
      progress = new UserProgress({
        userId,
        questionId,
        category,
        isReviewed,
      });
      await progress.save();
    }

    res.status(200).json({ message: 'Postęp zapisany' });
  } catch (error) {
    console.error('Błąd przy zapisywaniu postępu:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

export const getTotalQuestionsInCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ message: 'Kategoria jest wymagana' });
    }

    const totalQuestions = await Question.countDocuments({ category });

    res.json({ totalQuestions });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

export const getCompletedQuestions = async (req: Request, res: Response) => {
  try {
    const { userId, category } = req.query;

    if (!userId || !category) {
      return res.status(400).json({ message: 'Brak wymaganych parametrów: userId lub category' });
    }

    const completedQuestionsCount = await UserProgress.countDocuments({
      userId,
      category,
      isReviewed: true,
    });

    res.json({ completedQuestions: completedQuestionsCount });
  } catch (error) {
    console.error('Błąd przy pobieraniu ukończonych pytań:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};
