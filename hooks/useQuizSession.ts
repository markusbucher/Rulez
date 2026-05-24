import { useMemo } from 'react';
import type { Card } from '../data/types';

export type QuizOrder = 'sequential' | 'random';

export interface QuizFilters {
  order: QuizOrder;
  articles: string[];  // empty = all
  types: string[];     // empty = all
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useQuizSession(cards: Card[], filters: QuizFilters): Card[] {
  return useMemo(() => {
    let result = cards;

    if (filters.articles.length > 0) {
      // articles contains top-level keys (e.g. "3", "12").
      // Match the card's article exactly OR as a sub-article (e.g. "3.1", "3.1.2").
      result = result.filter((c) =>
        filters.articles.some(
          (a) => c.article === a || c.article.startsWith(a + '.')
        )
      );
    }

    if (filters.types.length > 0) {
      result = result.filter((c) => filters.types.includes(c.type));
    }

    if (filters.order === 'random') {
      result = shuffle(result);
    }

    return result;
  }, [cards, filters]);
}
