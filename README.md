# Drop-in patch: app/page.tsx + hero-bakgrund

Den här patchen innehåller **hela** `app/page.tsx` (landing) med DOM-baserad hero samt den optimerade hero-bakgrunden.
Inga alias-importer, inga client-only handlers. Klar att kopiera rakt in.

## Struktur
app/page.tsx
public/images/beer-radar-hero-bg.jpg

## Installation
1) Kopiera `app/page.tsx` till ditt repo och skriv över befintlig fil.
2) Lägg till bilden på: `public/images/beer-radar-hero-bg.jpg`.
3) Deploya på Vercel och gör en hård refresh i webbläsaren.

## Noter
- CTA-knapparna är länkar till `/sv` för friktionsfri SSR.
- Vill du väcka ett modal direkt från landing: gör `page.tsx` till Client Component och lägg till onClick → `document.getElementById('log-modal')?.showModal()`.
- Bakgrundsbilden är progressiv JPEG, lättviktig och funkar i både light/dark.
