import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'user' | 'admin';
  packageExpiration?: Date; 
  useOptimizedQuestions: boolean;
  googleId: string;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'user' },
  packageExpiration: { type: Date },
  useOptimizedQuestions: { type: Boolean, default: true },
  googleId: { type: String, required: false }
});

export default mongoose.model<IUser>('User', UserSchema);
