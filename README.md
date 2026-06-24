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

## Data

The app uses typed local mock data in `data/mock-data.ts` first. Supabase wiring is isolated in `lib/supabase.ts`; add the values from `.env.example` when auth and database tables are ready.

## Screens

- Home dashboard
- Quick Add workout and behavior logging
- Bike dashboard
- Kettlebell programs and strength work
- Progress trends
- Rebuild timeline
- Video / playlist library
