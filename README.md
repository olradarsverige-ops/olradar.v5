# Ölradar 2.0 – The Hype Edition

Detta repo är redo för ny GitHub/Vercel-deploy och uppgraderar din v5-bas utan att bryta strukturen.

## Snabbstart
```bash
pnpm i # eller npm/yarn
pnpm dev # http://localhost:3000
```

## Miljövariabler (Vercel → Project Settings → Environment Variables)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_STORAGE_BUCKET=photos
```
- `NEXT_PUBLIC_*` är avsiktligt publika i browsern.
- Admin/service keys hålls utanför klientkoden.

## Viktigt
- Behåll `app/layout.tsx` (Next App Router).
- Relativa imports (ingen `@`-alias).
- Inga postinstall SWC-hack.
- Fallback-bilder i `/public`.
