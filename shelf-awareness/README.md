# Shelf Awareness

Shelf Awareness is the pharmaceutical logistics frontend in this FE multi-system repository.

## Local Commands

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
npm run start
```

## Required Environment Variables

Create `.env.local` from `.env.example` and provide:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPPLIER_SERVICE_URL=
```

In development, localhost fallbacks are used only when the matching `NEXT_PUBLIC_*` variable is unset. In production, required values fail fast.
