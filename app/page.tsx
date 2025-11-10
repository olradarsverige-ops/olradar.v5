'use client'
import Link from 'next/link'
import { FadeIn, HypeCard, ShareButton } from '../components/ui'
import { Beer, Languages } from 'lucide-react'

export default function Page(){
  return (
    <main className="space-y-8">
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl p-8 border border-white/10 bg-radial">
          <div className="absolute inset-0 -z-10 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600 via-pink-500 to-indigo-500"></div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div>
              <h2 className="text-4xl font-bold">BeerRadar — The Hype Edition</h2>
              <p className="text-white/80 mt-2">Svenska eller engelska? Samma kärna, dubbelt så mycket skum.</p>
              <div className="flex gap-3 mt-5">
                <Link href="/sv" className="card-glass px-4 py-2 hover:scale-[1.02] transition inline-flex items-center gap-2">
                  <Beer size={18}/> Svenska
                </Link>
                <Link href="/en" className="card-glass px-4 py-2 hover:scale-[1.02] transition inline-flex items-center gap-2">
                  <Languages size={18}/> English
                </Link>
                <ShareButton title="Ölradar" text="Kolla denna ölradar!"/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <HypeCard><div className="text-sm">✨ Gradients & glass</div></HypeCard>
              <HypeCard><div className="text-sm">🏆 XP, badges, streaks</div></HypeCard>
              <HypeCard><div className="text-sm">🔔 Deal Alerts</div></HypeCard>
              <HypeCard><div className="text-sm">🗺️ Nearby sort</div></HypeCard>
            </div>
          </div>
        </div>
      </FadeIn>
    </main>
  )
}
