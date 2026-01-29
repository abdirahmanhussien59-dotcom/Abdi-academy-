
export type Language = 'so' | 'en' | 'ar';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: 'Grammar' | 'Vocabulary' | 'Speaking' | 'Listening';
  duration: string;
  difficulty: Difficulty;
  content?: string;
  image?: string;
  pronunciationGuide?: string;
}

export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatar: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export interface Challenge {
  word: string;
  definition: string;
  example: string;
  pronunciation: string;
}
