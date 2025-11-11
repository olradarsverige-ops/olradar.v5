// app/page.tsx — Landing (hero only on start, not on /[lang])
import Link from 'next/link'

export const metadata = {
  title: 'Ölradar – Du loggar, andra hittar',
  description: 'Logga ölen där du är. Hjälp andra hitta bra priser. Tillsammans håller vi kartan levande.',
};

export default function Page() {
  return (
    <main className="px-4 py-8 md:py-10">
      <div className="mx-auto max-w-6xl space-y-10">
        {/* HERO */}
        <section className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
          {/* Background image (can be replaced; keep path) */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/images/beer-radar-hero-bg.jpg?v=1)' }}
            aria-hidden
          />
          {/* Readability washes */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/45 to-black/10" aria-hidden />
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(900px 420px at 22% 45%, transparent 0%, rgba(0,0,0,.55) 65%)' }}
            aria-hidden
          />

          {/* Content */}
          <div className="relative grid md:grid-cols-2 gap-8 md:gap-10 p-8 md:p-12">
            <div className="self-center">
              <span className="inline-flex items-center gap-2 mb-3 text-sm px-3 py-1 rounded-full bg-white/10 backdrop-blur">
                <span>🍺</span> Ölradar / BeerRadar
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

            {/* Spacer for balance on desktop */}
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
