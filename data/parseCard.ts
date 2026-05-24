import type { RawCard, Card, FlashCard, MCCard } from './types';

const OPTION_SPLIT = /(?=\n[a-d]\) )/;

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

function normalizeArticle(value: string): string {
  return normalizeWhitespace(value);
}

function normalizeType(value: string): string {
  const normalized = normalizeWhitespace(value);
  const canonicalTypes: Array<[RegExp, string]> = [
    [/^Situation/i, 'Situation'],
    [/^Kommentar/i, 'Kommentar'],
    [/^Festlegung/i, 'Festlegung'],
    [/^Beispiel/i, 'Beispiel'],
    [/^Multiple Choice/i, 'Multiple Choice'],
    [/^Frage/i, 'Frage'],
  ];

  const mapping = canonicalTypes.find(([pattern]) => pattern.test(normalized));
  return mapping ? mapping[1] : normalized;
}

function parseMCCard(raw: RawCard): MCCard {
  const parts = raw.vorderseite.split(OPTION_SPLIT);
  const question = parts[0].trim();
  const options = parts.slice(1).map((p) => p.trim());
  return {
    id: raw.id,
    article: normalizeArticle(raw.artikel),
    articleTitle: raw.artikeltitel,
    type: normalizeType(raw.typ),
    front: raw.vorderseite,
    back: raw.rueckseite,
    format: 'multiple_choice',
    question,
    options,
    correctAnswer: raw.rueckseite.trim(),
    imageFront: raw.imageFront,
    imageBack: raw.imageBack,
  };
}

export function parseCard(raw: RawCard): Card {
  if (normalizeType(raw.typ) === 'Multiple Choice') {
    return parseMCCard(raw);
  }
  const card: FlashCard = {
    id: raw.id,
    article: normalizeArticle(raw.artikel),
    articleTitle: raw.artikeltitel,
    type: normalizeType(raw.typ),
    front: raw.vorderseite,
    back: raw.rueckseite,
    format: 'flashcard',
    imageFront: raw.imageFront,
    imageBack: raw.imageBack,
  };
  return card;
}
