export type CardStatus = 'new' | 'review' | 'done';

export interface RawCard {
  id: number;
  artikel: string;
  typ: string;
  vorderseite: string;
  rueckseite: string;
  artikeltitel?: string;
  // Optional image references: filename (looked up in imageRegistry) or a https:// URL
  imageFront?: string[];
  imageBack?: string[];
}

interface BaseCard {
  id: number;
  article: string;
  articleTitle?: string;
  type: string;
  front: string;
  back: string;
  imageFront?: string[];
  imageBack?: string[];
}

export interface FlashCard extends BaseCard {
  format: 'flashcard';
}

export interface MCCard extends BaseCard {
  format: 'multiple_choice';
  question: string;
  options: string[];
  correctAnswer: string;
}

export type Card = FlashCard | MCCard;

export interface Deck {
  id: string;
  sport: string;
  title: string;
  language: string;
  edition: string;
  cards: Card[];
}

export type AppProgress = Record<string, Record<number, CardStatus>>;

export interface LastSession {
  deckId: string;
  cardId: number;
}

export const STORAGE_KEYS = {
  progress: '@rulez/progress',
  lastSession: '@rulez/lastSession',
  appLanguage: '@rulez/language',
} as const;
