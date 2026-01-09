export enum EducationLevel {
  SD_LOW = 'SD Kelas 1-3',
  SD_HIGH = 'SD Kelas 4-6',
  SMP = 'SMP',
  SMA = 'SMA'
}

export interface FormData {
  level: EducationLevel;
  subject: string;
  topic: string;
  context: string; // The raw text input
  files: File[];
  includeSummary: boolean;
}

export interface QuestionOption {
  key: string; // A, B, C, D, E
  text: string;
}

export interface Question {
  id: number;
  stimulus: string; // The context/story/data/image description
  questionText: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string; // HOTS reasoning
}

export interface GeneratedContent {
  summary?: string;
  questions: Question[];
}

export interface ApiError {
  message: string;
}
