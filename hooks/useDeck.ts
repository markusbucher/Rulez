import { useMemo } from 'react';
import { getDeckById } from '../data/decks';
import type { Deck } from '../data/types';

export function useDeck(deckId: string): Deck | undefined {
  return useMemo(() => getDeckById(deckId), [deckId]);
}
