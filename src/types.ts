export type CategoryType = 
  | 'home' 
  | 'alphabet' 
  | 'animals' 
  | 'actions' 
  | 'flags' 
  | 'math' 
  | 'games' 
  | 'music' 
  | 'drawing';

export interface LetterItem {
  letter: string;
  upper: string;
  lower: string;
  word: string;
  meaningVi: string;
  imageEmoji: string;
  color: string;
  phoneticName?: string;
  phoneticSound?: string;
  mnemonic?: string;
  spellingExamples?: {
    onset: string;
    nucleus: string;
    result: string;
    tone?: string;
    speechText?: string;
  }[];
  strokeSteps?: string[];
}

export interface AnimalItem {
  id: string;
  nameVi: string;
  nameEn: string;
  category: 'domestic' | 'wild' | 'birds' | 'aquatic';
  categoryVi: string;
  emoji: string;
  soundDescription: string;
  soundType: 'dog' | 'cat' | 'bird' | 'rooster' | 'cow' | 'lion' | 'duck' | 'frog' | 'elephant' | 'monkey';
  funFactVi: string;
  bgColor: string;
}

export interface ActionItem {
  id: string;
  titleVi: string;
  titleEn?: string;
  descriptionVi: string;
  descriptionEn?: string;
  iconEmoji: string;
  category: 'routine' | 'learning' | 'play' | 'helping';
  bgColor: string;
  relatedItems: string[];
}

export interface FlagItem {
  id: string;
  code: string;
  countryVi: string;
  countryEn: string;
  flagEmoji: string;
  flagUrl?: string;
  capitalVi: string;
  greetingVi: string;
  greetingNative: string;
  continentVi: string;
  continentCode: 'all' | 'asia' | 'europe' | 'americas' | 'africa' | 'oceania';
  iconicSymbol: string;
  funFactVi?: string;
  bgColor: string;
}

export interface MathNumberItem {
  number: number;
  wordVi: string;
  wordEn?: string;
  itemEmoji: string;
  itemNameVi: string;
  itemNameEn?: string;
  color: string;
  dots: number;
}

export interface ShapeColorItem {
  id: string;
  nameVi: string;
  nameEn?: string;
  type: 'shape' | 'color';
  hex?: string;
  shapeType?: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond';
  emoji?: string;
}


export interface NurserySong {
  id: string;
  title: string;
  notes: { note: string; duration: number }[];
  lyrics: string;
}

export interface UserProgress {
  stars: number;
  completedLessons: string[];
  todayMinutes: number;
}
