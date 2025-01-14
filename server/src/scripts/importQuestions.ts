import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import dotenv from 'dotenv';
import path from 'path';
import Question, { IQuestion } from '../models/Question';

dotenv.config();

mongoose.connect(process.env.MONGO_URI!, {});

const importQuestions = async () => {
  const filePath = path.resolve(__dirname, '../../data/katalog_pytania_egzminacyjne_kandydat_05062024.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.worksheets[0];

  if (!sheet) {
    console.error('Sheet not found');
    process.exit(1);
  }

  await Question.deleteMany({}); // Usuwanie wszystkich poprzednich pytań

  const questions: IQuestion[] = [];
  for (const row of sheet.getRows(2, sheet.rowCount - 1)!) {
    const numerPytania = row.getCell(2).value?.toString().trim() || '';
    const content = row.getCell(3).value?.toString().trim() || '';
    const odpowiedzA = row.getCell(4).value?.toString().trim() || '';
    const odpowiedzB = row.getCell(5).value?.toString().trim() || '';
    const odpowiedzC = row.getCell(6).value?.toString().trim() || '';
    const poprawnaOdp = row.getCell(7).value?.toString().trim() || '';
    let media = row.getCell(8).value?.toString().trim() || '';
    const kategorie = row.getCell(9).value?.toString().trim() || '';

    // Jeśli nie ma mediów, ustawiamy domyślny obraz brak.png
    if (!media) {
      media = 'brak.png';
    }

    let answers;
    let type;
    if (poprawnaOdp === 'Tak' || poprawnaOdp === 'Nie') {
      type = 'podstawowe';
      answers = [
        { option: 'Tak', content: 'Tak', isCorrect: poprawnaOdp === 'Tak' },
        { option: 'Nie', content: 'Nie', isCorrect: poprawnaOdp === 'Nie' },
      ];
    } else {
      type = 'specjalistyczne';
      answers = [
        { option: 'A', content: odpowiedzA, isCorrect: poprawnaOdp === 'A' },
        { option: 'B', content: odpowiedzB, isCorrect: poprawnaOdp === 'B' },
        { option: 'C', content: odpowiedzC, isCorrect: poprawnaOdp === 'C' },
      ].filter(answer => answer.content !== '');
    }
    
    // Ustalenie punktów na podstawie treści pytania
    const points = Math.floor(Math.random() * 3) + 1; // tymczasowo losowa ocena

    const question = new Question({
      numerPytania,
      content,
      media,
      points,
      category: kategorie.split(',').map(cat => cat.trim()).join(','),
      answers,
      type,
    });
    questions.push(question);
  }

  for (const question of questions) {
    try {
      await question.save();
    } catch (error) {
      console.error('Error saving question:', error);
    }
  }

  console.log('Import completed');
  process.exit();
};

importQuestions().catch(error => {
  console.error(error);
  process.exit(1);
});
