import { Schema, model, Document } from 'mongoose';

export interface IAnswer {
  option: string;
  content: string;
  isCorrect: boolean;
}

export interface IQuestion extends Document {
  numerPytania: string;
  content: string;
  media?: string;
  points: number;
  category: string;
  answers: IAnswer[];
  type: string;
}

const answerSchema = new Schema<IAnswer>({
  option: { type: String, required: true },
  content: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const questionSchema = new Schema<IQuestion>({
  numerPytania: { type: String, required: true },
  content: { type: String, required: true },
  media: { type: String },
  points: { type: Number, required: true },
  category: { type: String, required: true },
  answers: [answerSchema],
  type: { type: String, required: true },
});

const Question = model<IQuestion>('Question', questionSchema);

export default Question;
