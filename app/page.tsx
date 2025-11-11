// app/page.tsx — Landing with DOM hero and graphic background
import Link from 'next/link'

export const metadata = {
  title: 'Ölradar – Du loggar, andra hittar',
  description: 'Hjälp andra att hitta bra ölpriser. Du loggar där du sitter, andra hittar.',
};

export default function Page() {
  return (
    <main className="space-y-10">
      {/* HERO */}
      <section
        className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/beer-radar-hero-bg.jpg)" }}
      >
        {/* overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/10 pointer-events-none" />

        <div className="relative px-6 md:px-10 py-10 md:py-14 flex flex-col md:flex-row items-start gap-10">
          <div className="flex-1">
            <span className="inline-block mb-3 text-sm px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
              Ölradar / BeerRadar
            </span>

            <h1 className="text-4xl md:text-5xl font-semibold mb-4">
              Du loggar – andra hittar.
            </h1>

            <p className="text-lg text-white/80 max-w-xl mb-8">
              Logga ölen där du är. Hjälp andra att hitta bra priser. Tillsammans håller vi kartan levande.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/sv"
                className="rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 backdrop-blur-sm transition"
              >
                Deal Alert
              </Link>

              <button
                className="rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 backdrop-blur-sm transition"
                aria-label="Dela"
              >
                Dela
              </button>

              <Link
                href="/sv"
                className="rounded-full px-5 py-2 font-medium text-zinc-900 bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.25)] hover:brightness-105 transition"
              >
                + Logga öl
              </Link>
            </div>
          </div>

          {/* right spacer keeps layout balanced on desktop */}
          <div className="hidden md:block flex-1" />
        </div>
      </section>

      {/* LANG SWITCH (kept minimal) */}
      <section className="flex flex-wrap gap-3">
        <Link href="/sv" className="rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 transition">
          Svenska
        </Link>
        <Link href="/en" className="rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 transition">
          English
        </Link>
      </section>
    </main>
  );
}
