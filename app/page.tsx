// app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen gradient-bg text-white">
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-2xl p-8 backdrop-blur-lg bg-white/5 border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <Image src="/images/beer-radar-hero.png" alt="BeerRadar hero" fill style={{ objectFit: "cover" }} priority />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4">BeerRadar / Ölradar</h1>
            <p className="text-lg opacity-90 max-w-2xl mb-6">
              Du loggar – andra hittar. Hjälp andra hitta billiga öl genom att logga priser där du är.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/sv" className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition">Svenska</Link>
              <Link href="/en" className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition">English</Link>
              <button onClick={() => navigator.share?.({ title: "Ölradar", url: typeof window !== 'undefined' ? window.location.href : '/' })} className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition">Dela</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/10 rounded-xl text-sm">✨ Gradients & glass</div>
              <div className="p-4 bg-white/10 rounded-xl text-sm">🏆 XP, badges, streaks</div>
              <div className="p-4 bg-white/10 rounded-xl text-sm">🔔 Deal alerts</div>
              <div className="p-4 bg-white/10 rounded-xl text-sm">📍 Nearby sort</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
