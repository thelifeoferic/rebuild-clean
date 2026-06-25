# REBUILD

A mobile-first Next.js App Router PWA for tracking fitness, weight, reset triggers, and positive habit substitutions.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If your machine reports too many watched files, run:

```bash
WATCHPACK_POLLING=true npm run dev
```

## Data and privacy

The app starts from a blank local dataset. Logs are saved in `localStorage`, so each phone or browser keeps its own separate data. A different device, private window, or cleared browser starts fresh until Supabase auth/database sync is connected.

Supabase wiring is isolated in `lib/supabase.ts` and `lib/supabase-sync.ts`. Until Supabase is configured, the Cloud Sync card stays in local-only mode.

## Supabase setup

1. Create a Supabase project.
2. In Supabase, open SQL Editor and run `supabase/schema.sql`.
3. In Project Settings > API, copy the Project URL and anon public key.
4. In Authentication > URL Configuration, set the Site URL to your deployed Vercel URL and add the same URL to Redirect URLs.
5. In Vercel, add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

6. Redeploy the app.
7. On the Home screen, use Cloud Sync to send yourself a magic link, then tap Sync to back up this device or Pull to load cloud data onto another device.

The current sync model stores the user profile in `rebuild_profiles` and the full local app state in `rebuild_data_snapshots`. That gives quick cross-device backup now, while leaving room to normalize every log into separate analytics tables later.

## AI Body Check setup

The Body tab lets a signed-in user upload or take a clothed progress photo and receive non-medical coaching feedback. Photos are resized in the browser, sent once to the server route, and are not saved automatically by REBUILD.

To enable live AI analysis in Vercel, add this Environment Variable:

```bash
OPENAI_API_KEY=your-openai-api-key
```

Optional:

```bash
OPENAI_MODEL=gpt-4.1-mini
```

If `OPENAI_API_KEY` is missing, the app shows a safe demo analysis so the screen still works during setup.

## Screens

- Home dashboard
- Quick Add workout and behavior logging
- Bike dashboard
- Kettlebell programs and strength work
- Progress trends
- AI Body Check
- Rebuild timeline
- Video / playlist library

## Current product depth

- Onboarding with first name, baseline weight, height, goals, equipment, behavior loops, and personal why
- Local-first workout, food, weight, swim, yoga, and reset logging
- Calorie/protein guide on the home dashboard
- Cloud Sync card for Supabase magic-link auth, backup, and restore
- Goal-aware training recommendations based on onboarding goals and available equipment
- Searchable food selector with category dropdowns and compact macro rows
- Strength lift logging for general gym movements and machine weights
- Home, gym, swim, yoga, kettlebell, and travel workout templates
- Exercise guide cards plus visual form cue diagrams
- AI Body Check for progress-photo coaching, posture cues, and next-step recommendations
- Embedded YouTube media library and one-tap TIDAL playlist
