# Patch: Hero-bakgrund (Alternativ A)

Den här patchen lägger till en hero-bakgrundsbild och ett JSX-block att klistra in.
Bild-filen i patchen är en sober gradient-placeholder. Byt gärna ut den mot din ölglas-bild
med **samma filnamn** (`beer-glasses-hero.jpg`) för att få fotot utan kodändringar.

## Innehåll
- `public/images/beer-glasses-hero.jpg` – placeholder (kan ersättas av din ölglas-bild)
- `snippet-hero-artwork.tsx` – färdigt JSX-block att klistra in i `app/[lang]/page.tsx` (och ev. `app/page.tsx`)

## Steg
1. Lägg till/ersätt filen på `public/images/beer-glasses-hero.jpg`.
2. Öppna din sida och ersätt den svarta rutan under rubriken med innehållet i `snippet-hero-artwork.tsx`.
3. Deploya.

Blocket har overlay + höjd som ser bra ut på både mobil och desktop.
