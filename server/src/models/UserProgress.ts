import { Schema, model, Document } from 'mongoose';

export interface IUserProgress extends Document {
  userId: string; 
  questionId: string;
  category: string;
  isReviewed: boolean;
}

const userProgressSchema = new Schema<IUserProgress>({
  userId: { type: String, required: true },
  questionId: { type: String, required: true },
  category: { type: String, required: true },
  isReviewed: { type: Boolean, default: false },
});

const UserProgress = model<IUserProgress>('UserProgress', userProgressSchema);

export default UserProgress;
