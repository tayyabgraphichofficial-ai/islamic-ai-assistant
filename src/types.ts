export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  references?: string[];
  isRefused?: boolean;
  image?: string;
}

export interface IslamicBook {
  id: string;
  titleUrdu: string;
  titleEnglish: string;
  category: 'Quran' | 'Hadith' | 'Seerah' | 'Fiqh' | 'Tafseer';
  descriptionUrdu: string;
  descriptionEnglish: string;
  authorUrdu: string;
  authorEnglish: string;
  chaptersCount?: number;
}

export interface PresetQuestion {
  id: string;
  questionUrdu: string;
  questionEnglish: string;
  category: string;
}

export interface Bookmark {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  source?: string;
}
