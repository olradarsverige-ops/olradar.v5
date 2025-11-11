// app/page.tsx
import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="space-y-10">
      {/* HERO */}
      <section className="relative rounded-3xl border border-white/10 bg-[radial-gradient(60rem_40rem_at_85%_20%,rgba(247,181,0,0.08),transparent_60%),radial-gradient(30rem_20rem_at_30%_10%,rgba(0,163,255,0.08),transparent_60%)] bg-[length:100%_100%] bg-[#0b1620] p-6 md:p-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        {/* soft overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/5" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-sm text-white/80 ring-1 ring-white/10">
            <span>🍺</span>
            <span>Ölradar / BeerRadar</span>
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Du loggar – andra <span className="text-white/90">hittar</span>.
          </h1>

          <p className="mt-4 max-w-2xl text-base text-white/70 md:text-lg">
            Logga ölen där du är. Hjälp andra att hitta bra priser. Tillsammans håller vi kartan levande.
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/sv"
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 font-medium text-black shadow-[0_0_0_3px_rgba(251,191,36,0.25)] hover:brightness-105 transition"
            >
              <span>＋</span> Logga öl
            </Link>
            <Link
              href="#share"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white/80 hover:bg-white/10 transition"
            >
              Dela
            </Link>
            <Link
              href="#alerts"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white/80 hover:bg-white/10 transition"
            >
              Deal Alert
            </Link>

            {/* Language pills — now INSIDE the hero */}
            <div className="ml-auto flex gap-2">
              <Link
                href="/sv"
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Svenska
              </Link>
              <Link
                href="/en"
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition"
              >
                English
              </Link>
            </div>
          </div>
        </div>

        {/* decorative bg image (kept light) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{
            backgroundImage: 'url(/images/beer-radar-hero-bg.jpg?v=1)',
            backgroundPosition: 'center right',
            backgroundSize: 'cover',
            opacity: 0.35,
            mixBlendMode: 'plus-lighter'
          }}
        />
      </section>
    </main>
  )
}
