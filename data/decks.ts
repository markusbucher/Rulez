import type { Deck } from './types';
import { parseCard } from './parseCard';
import rbb2025Raw from './karteikarten_rbb_2025.json';

export const DECKS: Deck[] = [
  {
    id: 'iwbf_rbb_2025',
    sport: 'Wheelchair Basketball',
    title: 'Rule Interpretation 2025',
    language: 'de',
    edition: '2025',
    cards: (rbb2025Raw as any[]).map(parseCard),
  },
];

export function getDeckById(id: string): Deck | undefined {
  return DECKS.find((d) => d.id === id);
}
