// app/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Landing() {
  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Ölradar / BeerRadar',
          text: 'Hjälp andra hitta billiga öl — logga en öl där du är.',
          url: typeof window !== 'undefined' ? window.location.href : 'https://olradar-v5.vercel.app',
        });
      } else {
        await navigator.clipboard.writeText(
          typeof window !== 'undefined' ? window.location.href : 'https://olradar-v5.vercel.app'
        );
        alert('Länk kopierad!');
      }
    } catch {
      /* no-op */
    }
  };

  const onDealAlert = async () => {
    try {
      if (typeof Notification !== 'undefined') {
        const ok = await Notification.requestPermission();
        if (ok === 'granted') {
          alert('Toppen! Jag pingar när nya fynd dyker upp.');
        } else {
          alert('Du kan slå på aviseringar i webbläsarens inställningar.');
        }
      } else {
        alert('Din webbläsare saknar stöd för notiser.');
      }
    } catch {
      /* no-op */
    }
  };

  return (
    <main className="space-y-6">
      {/* HERO */}
      <section className="relative rounded-2xl border border-white/10 bg-white/[.04] overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-6 items-center p-5 sm:p-6 lg:p-8">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-sm mb-3">
              <span className="font-medium">Ölradar / BeerRadar</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
              Du loggar – andra hittar.
            </h1>
            <p className="mt-3 text-white/80 max-w-xl">
              Logga ölen där du är. Hjälp andra att hitta bra priser. Tillsammans håller vi kartan
              levande.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="btn" onClick={onDealAlert}>
                🔔 Deal Alert
              </button>
              <button type="button" className="btn" onClick={onShare}>
                🔗 Dela
              </button>
              <Link href="/sv" className="btn">
                🇸🇪 Svenska
              </Link>
              <Link href="/en" className="btn">
                🇬🇧 English
              </Link>
              <Link href="/sv" className="btn-primary fab">
                + Logga öl
              </Link>
            </div>
          </div>

          <div className="relative aspect-[16/9] lg:aspect-[7/5] rounded-xl overflow-hidden border border-white/10">
            <Image
              src="/images/beer-radar-hero.png"
              alt="Ölradar / BeerRadar"
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5" />
          </div>
        </div>
      </section>

      {/* Liten förklaring */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-glass p-4">
          <div className="font-medium mb-1">✨ Gradients & glass</div>
          <div className="text-white/70 text-sm">Modern look utan att offra prestanda.</div>
        </div>
        <div className="card-glass p-4">
          <div className="font-medium mb-1">🏆 XP, badges, streaks</div>
          <div className="text-white/70 text-sm">Logga öl – lås upp nivåer och badges.</div>
        </div>
        <div className="card-glass p-4">
          <div className="font-medium mb-1">🔔 Deal Alerts</div>
          <div className="text-white/70 text-sm">Få notiser när nya fynd dyker upp.</div>
        </div>
        <div className="card-glass p-4">
          <div className="font-medium mb-1">🗺️ Nearby sort</div>
          <div className="text-white/70 text-sm">Sortera efter avstånd och pris.</div>
        </div>
      </section>
    </main>
  );
}
