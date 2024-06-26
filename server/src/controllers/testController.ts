import { Request, Response } from 'express';
import Question from '../models/Question';

const getExamQuestions = async (req: Request, res: Response) => {
  try {
    const allQuestions = await Question.find();

    const basicQuestions = allQuestions.filter(q => 
      q.category.split(',').includes('B') && q.type === 'podstawowe'
    );

    const specialistQuestions = allQuestions.filter(q => 
      q.category.split(',').includes('B') && q.type === 'specjalistyczne'
    );

    //console.log('Basic Questions:', basicQuestions.length);
    //console.log('Specialist Questions:', specialistQuestions.length);

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

    //console.log('Selected Basic Questions:', selectedBasicQuestions.length);
    //console.log('Selected Specialist Questions:', selectedSpecialistQuestions.length);

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

export { getExamQuestions };
