import mongoose, { Document, Schema } from 'mongoose';

interface ITestResult extends Document {
  userId: mongoose.Types.ObjectId;
  score: number;
  date: Date;
  answers: {
    questionId: mongoose.Types.ObjectId;
    answer: string;
    correct: boolean;
    timeSpent: number;
  }[];
}

const TestResultSchema: Schema = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  answers: [
    {
      questionId: { type: mongoose.Types.ObjectId, required: true },
      answer: { type: String, required: true },
      correct: { type: Boolean, required: true },
      timeSpent: { type: Number, required: false, default: 0 },
    },
  ],
});

export default mongoose.model<ITestResult>('TestResult', TestResultSchema);
