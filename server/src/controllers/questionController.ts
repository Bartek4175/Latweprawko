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
    const { type, category } = req.query;
    const query: { type?: string; category?: string } = {};

    if (type && type !== 'losowe') {
      query.type = type as string;
    }

    if (category) {
      query.category = category as string;
    }

    const count = await Question.countDocuments(query);
    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne(query).skip(random);

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getQuestionExplanation = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);

    if (question) {
      res.json({
        explanation: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
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
