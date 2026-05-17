const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'karteikarten_rbb_2025.json');
const rawCards = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const normalizeWhitespace = (value) => value.replace(/\s+/g, ' ').trim();
const getCanonicalType = (value) => {
  const normalized = normalizeWhitespace(value);
  const mappings = [
    [/^Situation/i, 'Situation'],
    [/^Kommentar/i, 'Kommentar'],
    [/^Festlegung/i, 'Festlegung'],
    [/^Beispiel/i, 'Beispiel'],
    [/^Multiple Choice/i, 'Multiple Choice'],
    [/^Frage/i, 'Frage'],
  ];
  const mapping = mappings.find(([pattern]) => pattern.test(normalized));
  return mapping ? mapping[1] : normalized;
};

const issues = [];
const ids = new Map();
const articleProblems = [];
const typeValues = new Set();
const canonicalTypeSuggestions = new Map();
const suspiciousCards = [];

const pageMarkerRegex = /\b\d{1,2}-\d{1,3}\b/;
const headerFooterRegex = /\b(REGEL|Art\.|Beispiel|Festlegung)\b\s*[IVXL0-9a-zA-Z]*\s*$/i;

for (const card of rawCards) {
  const { id, artikel, typ, vorderseite, rueckseite } = card;

  if (typeof id !== 'number') {
    issues.push(`card#${id}: invalid id type (${typeof id})`);
  }

  if (!Number.isInteger(id)) {
    issues.push(`card#${id}: id is not an integer`);
  }

  if (ids.has(id)) {
    issues.push(`duplicate id ${id} found in cards ${ids.get(id)} and ${JSON.stringify(card)}`);
  } else {
    ids.set(id, card);
  }

  if (typeof artikel !== 'string' || normalizeWhitespace(artikel).length === 0) {
    articleProblems.push({ id, artikel });
  }

  if (typeof typ !== 'string' || normalizeWhitespace(typ).length === 0) {
    issues.push(`card#${id}: missing or empty typ`);
  }

  const canonicalType = getCanonicalType(typ);
  typeValues.add(typ.trim());
  canonicalTypeSuggestions.set(typ.trim(), canonicalType);

  if (typeof vorderseite !== 'string' || vorderseite.trim().length === 0) {
    issues.push(`card#${id}: missing or empty vorderseite`);
  }

  if (typeof rueckseite !== 'string' || rueckseite.trim().length === 0) {
    issues.push(`card#${id}: missing or empty rueckseite`);
  }

  const suspiciousMatches = [];
  if (pageMarkerRegex.test(vorderseite) || pageMarkerRegex.test(rueckseite)) {
    suspiciousMatches.push('page marker');
  }
  if (headerFooterRegex.test(vorderseite) || headerFooterRegex.test(rueckseite)) {
    suspiciousMatches.push('header/footer text');
  }
  if (/\b(Art\.|REGEL|Mannschaften|Spieluhr|Wurfuhr|Freiwurf)\b/.test(vorderseite) && vorderseite.split('\n').length > 4) {
    suspiciousMatches.push('long header-style content');
  }

  if (suspiciousMatches.length > 0) {
    suspiciousCards.push({ id, typ, artikel, reasons: suspiciousMatches, frontPreview: vorderseite.slice(0, 200), backPreview: rueckseite.slice(0, 200) });
  }
}

console.log('=== card data validation ===');
console.log(`cards checked: ${rawCards.length}`);
console.log(`unique raw typ values: ${typeValues.size}`);
console.log('');

console.log('type normalization suggestions:');
for (const [rawType, canonicalType] of canonicalTypeSuggestions.entries()) {
  if (rawType !== canonicalType) {
    console.log(`  ${JSON.stringify(rawType)} -> ${JSON.stringify(canonicalType)}`);
  }
}
console.log('');

if (articleProblems.length > 0) {
  console.log('article problems:');
  for (const problem of articleProblems) {
    console.log(`  card#${problem.id}: ${JSON.stringify(problem.artikel)}`);
  }
  console.log('');
}

if (issues.length > 0) {
  console.log('issues:');
  for (const issue of issues) {
    console.log(`  - ${issue}`);
  }
  console.log('');
}

console.log(`suspicious cards: ${suspiciousCards.length}`);
if (suspiciousCards.length > 0) {
  for (const card of suspiciousCards.slice(0, 20)) {
    console.log(`  card#${card.id} (${card.artikel} / ${card.typ}): ${card.reasons.join(', ')}`);
  }
  if (suspiciousCards.length > 20) {
    console.log(`  ...plus ${suspiciousCards.length - 20} more suspicious cards`);
  }
}

if (issues.length === 0 && articleProblems.length === 0) {
  console.log('\nvalidation passed.');
  process.exit(0);
}

process.exit(1);
