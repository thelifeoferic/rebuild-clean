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

Supabase wiring is isolated in `lib/supabase.ts`; add the values from `.env.example` when auth and database tables are ready.

## Screens

- Home dashboard
- Quick Add workout and behavior logging
- Bike dashboard
- Kettlebell programs and strength work
- Progress trends
- Rebuild timeline
- Video / playlist library

## Current product depth

- Onboarding with first name, baseline weight, height, goals, equipment, behavior loops, and personal why
- Local-first workout, food, weight, swim, yoga, and reset logging
- Calorie/protein guide on the home dashboard
- Strength lift logging for general gym movements and machine weights
- Home, gym, swim, yoga, kettlebell, and travel workout templates
- Exercise guide cards plus visual form cue diagrams
- Embedded YouTube media library and one-tap TIDAL playlist
