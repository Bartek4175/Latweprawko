export interface Answer {
  option: string;
  content: string;
  isCorrect: boolean;
}

export interface Question {
  _id: string;
  numerPytania: string;
  content: string;
  media?: string;
  points: number;
  category: string;
  answers: Answer[];
  type: string;
}

export interface TestResult {
  _id: string;
  userId: string;
  score: number;
  date: string;
  answers: {
    questionId: string;
    answer: string;
    correct: boolean;
    timeSpent?: number;
  }[];
}

export interface User {
  _id: string;
  email: string;
  role: 'user' | 'admin';
  packageExpiration?: Date;
  useOptimizedQuestions: boolean;
  googleId?: string;
}
