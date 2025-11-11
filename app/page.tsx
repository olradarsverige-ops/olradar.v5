// app/page.tsx — Landing v2 (refined hero visuals)
import Link from 'next/link'

export const metadata = {
  title: 'Ölradar – Du loggar, andra hittar',
  description: 'Hjälp andra att hitta bra ölpriser. Du loggar där du sitter, andra hittar.',
};

export default function Page() {
  return (
    <main className="px-4 py-8 md:py-10">
      <div className="mx-auto max-w-6xl space-y-10">
        {/* HERO */}
        <section className="relative rounded-2xl overflow-hidden border border-white/10">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/images/beer-radar-hero-bg.jpg)' }}
            aria-hidden
          />
          {/* Soft gradient wash */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/10" aria-hidden />
          {/* Radial focus on left */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(800px 400px at 20% 45%, rgba(0,0,0,0.0), rgba(0,0,0,0.55))',
            }}
            aria-hidden
          />

          {/* Content */}
          <div className="relative grid md:grid-cols-2 gap-8 md:gap-10 p-8 md:p-12">
            <div className="self-center">
              <span className="inline-flex items-center gap-2 mb-3 text-sm px-3 py-1 rounded-full bg-white/10 backdrop-blur">
                <span className="i">🍺</span> Ölradar / BeerRadar
              </span>

              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                Du loggar – andra hittar.
              </h1>

              <p className="mt-4 text-base md:text-lg text-white/80 max-w-xl">
                Logga ölen där du är. Hjälp andra att hitta bra priser. Tillsammans håller vi kartan levande.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/sv"
                  className="rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 backdrop-blur transition"
                >
                  Deal Alert
                </Link>

                <button
                  className="rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 backdrop-blur transition"
                  aria-label="Dela"
                >
                  Dela
                </button>

                <Link
                  href="/sv"
                  className="rounded-full px-5 py-2 font-medium text-zinc-900 bg-amber-400 shadow-[0_8px_40px_rgba(251,191,36,0.25)] ring-1 ring-amber-300/40 hover:brightness-105 active:translate-y-px transition"
                >
                  + Logga öl
                </Link>
              </div>
            </div>

            {/* Right visual spacer to keep balance; keeps layout tight */}
            <div className="hidden md:block" />
          </div>
        </section>

        {/* LANG SWITCH */}
        <section className="flex flex-wrap gap-3">
          <Link href="/sv" className="rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 transition">
            Svenska
          </Link>
          <Link href="/en" className="rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 transition">
            English
          </Link>
        </section>
      </div>
    </main>
  );
}
