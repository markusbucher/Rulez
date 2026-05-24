# Rulez

A mobile-first flashcard app for referees, players, and coaches to learn sport rules and their interpretation. Built with Expo (React Native) — runs on iOS, Android, and web.

## First release

**Wheelchair Basketball – Rule Interpretation 2025** (IWBF, in German)  
246 cards across 87 articles, covering Situations, Comments, Rulings, and Examples.

---

## Features

- **Flashcard quiz** — tap to reveal the ruling; mark as done, review later, or go back
- **Multiple-choice questions** — options parsed from card content; correct answer highlighted after selection
- **Status tracking** — every card is `new`, `review`, or `done`; persisted locally with AsyncStorage
- **Filter by status** — tap the New / Review / Done counters on the deck home to quiz only those cards
- **Quiz setup** — choose sequential or random order; filter by article and card type before starting
- **Card overview** — all cards grouped by article in collapsible sections with status indicators
- **Session resume** — last-viewed card is saved and offered for resume on next launch
- **Images** — cards can carry multiple images on the front and/or back; tap to view fullscreen
- **Multilingual UI** — German and English; auto-detected from device locale, overridable in Settings
- **Multi-sport ready** — add any sport by dropping in a JSON deck file (see below)
- **Web support** — runs in the browser via `expo start --web`

---

## Tech stack

| Layer | Library |
|---|---|
| Framework | Expo SDK 55 (managed workflow) |
| Navigation | expo-router (file-based) |
| Language | TypeScript |
| Persistence | @react-native-async-storage/async-storage |
| i18n | i18next + react-i18next + expo-localization |
| Web | react-native-web + react-dom |

---

## Getting started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- iOS: Xcode + Simulator **or** [Expo Go](https://apps.apple.com/app/expo-go/id982107779) on a physical device
- Android: Android Studio + emulator **or** Expo Go on a physical device

### Install & run

```bash
git clone <repo-url>
cd Rulez
npm install --legacy-peer-deps

# Start the Metro bundler (choose a platform)
npm start          # interactive — scan QR code with Expo Go
npm run ios        # open in iOS simulator
npm run android    # open in Android emulator
npm run web        # open in browser at http://localhost:8081
```

> **Expo Go version**: use Expo Go **55.0.34** (SDK 55). Older versions will show a TurboModule error.

---

## Project structure

```
app/
  _layout.tsx              Root layout — language init, web shell
  index.tsx                Deck selection (home screen)
  [deckId]/
    _layout.tsx            Deck layout (headerless stack)
    index.tsx              Deck home — progress summary, start quiz
    quiz-setup.tsx         Order + article + type filter picker
    quiz.tsx               Quiz session (flashcard & MC)
    overview.tsx           Collapsible article overview
    settings.tsx           Language picker, reset progress

components/
  FlashCard.tsx            Tap-to-reveal card with fade animation
  MCQuestion.tsx           Multiple-choice option buttons
  CardImage.tsx            Scrollable image strip + fullscreen lightbox
  ActionButtons.tsx        Accept / Mark Review / Accept & Overview
  ArticleGroup.tsx         Collapsible overview section
  DeckCard.tsx             Deck list item on home screen
  CardStatusBadge.tsx      new / review / done colour badge
  ProgressBar.tsx          Horizontal progress bar

data/
  types.ts                 All TypeScript interfaces and storage keys
  parseCard.ts             RawCard → FlashCard | MCCard parser
  decks.ts                 DECKS registry — add new sports here
  imageRegistry.ts         Local image filename → require() map
  karteikarten_rbb_2025.json  Wheelchair Basketball source data

hooks/
  useProgress.ts           Read/write card progress via AsyncStorage
  useQuizSession.ts        Build filtered + ordered card list for a session
  useDeck.ts               Load a deck by id
  useLanguage.ts           Read/write app language preference

locales/
  en.json                  English UI strings
  de.json                  German UI strings
```

---

## Adding a new sport

1. **Prepare the data** — create a JSON file in `data/` following the card format (see below).
2. **Register the deck** — add one entry to `DECKS` in `data/decks.ts`:
   ```ts
   import myDeckRaw from './my_deck.json';

   {
     id: 'fiba_basketball_2024',
     sport: 'Basketball',
     title: 'Official Rules 2024',
     language: 'de',
     edition: '2024',
     cards: (myDeckRaw as any[]).map(parseCard),
   }
   ```
3. That's it. All screens, hooks, and progress tracking work automatically.

---

## Card JSON format

```jsonc
// Flashcard (most cards)
{
  "id": 1,                          // unique integer within the deck
  "artikel": "3.1.1",              // article reference shown in the UI
  "typ": "Situation",              // Situation | Kommentar | Festlegung | Beispiel | …
  "vorderseite": "Question text",  // front / question side
  "rueckseite": "Ruling text",     // back / answer side
  "imageFront": ["diagram.png"],   // optional — array of images for the question side
  "imageBack":  ["https://…"]      // optional — array of images for the answer side
}

// Multiple Choice card — set typ to "Multiple Choice"
// Options must be prefixed with "a) ", "b) ", "c) ", "d) " on separate lines in vorderseite
// rueckseite must be the exact text of the correct option
{
  "id": 42,
  "artikel": "10",
  "typ": "Multiple Choice",
  "vorderseite": "Welcher Spieler ist teilnahmeberechtigt?\na) Option A\nb) Option B\nc) Option C\nd) Option D",
  "rueckseite": "a) Option A"
}
```

### Adding images to cards

**Remote images** — use a full `https://` URL directly in the JSON. No further setup needed.

**Local images:**
1. Drop the file into `assets/images/`
2. Register it in `data/imageRegistry.ts`:
   ```ts
   const localImages: Record<string, number> = {
     'my-diagram.png': require('../assets/images/my-diagram.png'),
   };
   ```
3. Reference it by filename in the JSON: `"imageFront": ["my-diagram.png"]`

Multiple images per side are supported — they appear as a horizontally scrollable thumbnail strip. Tap any thumbnail to open a fullscreen lightbox.

---

## i18n — adding a new language

1. Create `locales/xx.json` (copy `en.json` as a template)
2. In `i18n/index.ts`, add the new locale to the `resources` object and the `SupportedLanguage` union type
3. Add the language picker option in `app/[deckId]/settings.tsx`

---

## Deployment

### Expo Go (development / testing)

```bash
npm start
# Scan the QR code with Expo Go on iOS or Android
```

### Production build — iOS (Xcode)

Requires macOS and Xcode 15+.

```bash
# Generate native iOS project
npx expo prebuild --platform ios

# Open in Xcode and archive for distribution
open ios/Rulez.xcworkspace
```

In Xcode: select **Any iOS Device** as the target → **Product → Archive** → **Distribute App** → upload to App Store Connect or export an IPA.

Requires an Apple Developer account ($99/year) for App Store distribution.

### Production build — Android (Gradle)

Requires Android Studio and a JDK 17+ installation.

```bash
# Generate native Android project
npx expo prebuild --platform android

# Build a release APK or AAB
cd android
./gradlew assembleRelease   # APK
./gradlew bundleRelease     # AAB (required for Play Store)
```

Output:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

Sign the build with your keystore before uploading to the Play Store. See the [Android signing guide](https://developer.android.com/studio/publish/app-signing).

### Web (static export)

```bash
npx expo export --platform web --output-dir dist
```

The `dist/` folder is a self-contained static site. Deploy to any static host:

```bash
# Netlify
netlify deploy --dir dist --prod

# Vercel
vercel dist/

# GitHub Pages / any static host
# Upload the contents of dist/ to your web server
```

---

## Validate card data

A validation script checks for duplicate IDs, missing required fields, and broken Multiple Choice cards:

```bash
npm run validate-data
```

---

## Progress & storage

All progress is stored **locally on the device** using AsyncStorage. No account or network connection required.

| Key | Contents |
|---|---|
| `@rulez/progress` | `{ [deckId]: { [cardId]: 'new' \| 'review' \| 'done' } }` |
| `@rulez/lastSession` | `{ deckId, cardId }` — last viewed card for resume |
| `@rulez/language` | `'de'` or `'en'` — user's language preference |

Progress can be reset per deck in **Settings → Reset Progress**.
