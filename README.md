# Alcohol Calculator

Alcohol Calculator is an Expo/React Native mobile app for alcohol-related calculations, drink knowledge, cocktail recipes, quizzes, and personal drink tracking.

## Main Features

- Alcohol calculators: dilution, blending, calories, BAC estimate, freezing point, Proof conversion, unit conversion, pure alcohol amount
- Home content hub with daily recommendations, popular content, seasonal collections, favorites, and recently viewed content
- Cocktail recipes with Korean and global drink ideas
- Drink encyclopedia with ABV, calories, serving temperature, pairing, and safety-oriented knowledge entries
- Category-based alcohol quiz
- Drink tracker with weekly stats and optional local notifications
- Local-only favorites and recent content storage using AsyncStorage
- Ad-supported layout with non-blocking banner and quiz completion ad placements

## Development

Install dependencies:

```bash
npm install
```

Start Metro for a development client:

```bash
npx expo start --dev-client
```

Run on Android:

```bash
npx expo run:android
```

Run on iOS:

```bash
npx expo run:ios
```

## Verification

```bash
npx tsc --noEmit
npm run lint
npx expo export --platform android --output-dir .expo-export-test
npx expo export --platform ios --output-dir .expo-export-test
```

Remove the temporary export directory after export checks:

```bash
rm -rf .expo-export-test
```

## Content Model

The current app does not require a backend. Recipes, encyclopedia entries, quiz categories, popular content, and seasonal collections are local static data. Favorites and recently viewed content are stored on-device with AsyncStorage.
