# Roomorph — prototype v0.1

AI interior redesign app (Expo SDK 57 · React Native · TypeScript · Expo Router).
This is the **prototype**: the full flow works end to end on your phone, with
mock payments and no backend yet.

## Run it on your phone (Expo Go)

1. Install **Node 20+** on your computer, and **Expo Go** on your phone (App Store / Play Store).
2. In this folder:
   ```bash
   npm install
   npx expo start
   ```
3. Scan the QR code with your phone camera (iOS) or the Expo Go app (Android).
   Phone and computer must be on the same Wi-Fi. If not, run `npx expo start --tunnel`.

## Mock vs real AI

- **Mock (default):** generation waits ~4s and returns your photo with a style tint.
  Good for testing flow and design.
- **Real AI:** copy `.env.example` to `.env.local`, add your OpenAI key, restart `npx expo start`.
  Uses `gpt-image-2` via the images/edits endpoint. Standard ≈ medium quality, HD ≈ high quality.
  ⚠️ Prototype only — the key is bundled in the app. Use a separate OpenAI project key with a low budget cap.
  The production build moves this call to a Supabase Edge Function.

## Where things live

```
src/theme.ts              ← colours, type, spacing, radii (reskin here)
src/config/styles.ts      ← the 8 MVP styles: name, description, AI prompt, palette
src/config/options.ts     ← prompt chips, quality + credit packs
src/lib/prompt.ts         ← prompt assembly (moves server-side later)
src/lib/generate.ts       ← mock / OpenAI generation
src/store/app-store.tsx   ← credits, history, draft (local storage for now)
src/components/           ← Button, Header, Chip, BeforeAfterSlider, StyleCard, Logo
src/app/                  ← screens (every file = a route)
  onboarding.tsx
  (tabs)/index.tsx · history.tsx · settings.tsx
  create/capture → style (skipped if picked on Home) → details → generating
  result/[id].tsx
  paywall.tsx
```

## What's mocked in the prototype

- Sign in, restore purchases, privacy/terms → "coming soon" alerts
- Purchases → instantly add credits (no payment)
- Credits/history → stored on the device only
- Style thumbnails → drawn room illustrations in each style's palette
- Report button → alert only
- Settings → "Prototype tools": add test credits, replay onboarding, see AI mode

## Known Expo Go limits

- **Save to Photos** on Android may not work in Expo Go (media-library restrictions). Share still works.
  A development build fixes this.

## Web prototype (GitHub Pages)

Every push to `main` builds the web version and publishes it with GitHub Actions
(`.github/workflows/deploy-pages.yml`). One-time setup: repo **Settings → Pages →
Source: GitHub Actions**. The site is served at
`https://<your-username>.github.io/Roomorph/` — `experiments.baseUrl` in `app.json`
must match the repo name.

Build it locally with `npm run build:pages` (output in `dist/`).
