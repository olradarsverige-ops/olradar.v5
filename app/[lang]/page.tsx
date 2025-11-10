'use client'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { FadeIn, HypeCard, Chip, TrophyPill, BellButton, ShareButton } from '../../components/ui'
import Image from 'next/image'
import { MapPin, Camera, Star } from 'lucide-react'
import { xpForLogs, badgeForCount, streakFromDates, isHappyHourNow } from '../../lib/game'
import { fireConfetti } from '../../components/confetti'

type Venue = { id: string; name: string; address: string; city: string; country: string; lat: number; lng: number; open_now: boolean; hours: any }
type Deal = { id: string; price_sek: number; price_original: number; currency: string; rating: number | null; user_id: string | null; photo_url: string | null; created_at: string; venue_id: string; beer_id: string; beer?: { name: string, style: string | null, abv: number | null } }
type NearbyItem = { venue: Venue; deal: Deal | null; distance?: number }
const cities = ['Helsingborg','Stockholm','Göteborg','Malmö'] as const

export default function LangPage(){
  const params = useParams<{lang: string}>()
  const lang = (params?.lang || 'sv') as 'sv' | 'en'
  const t = (sv:string, en:string) => lang==='sv'? sv: en

  const [city, setCity] = useState<typeof cities[number]>('Stockholm')
  const [q, setQ] = useState(''); const [sort, setSort] = useState<'standard'|'cheap'|'nearby'>('standard')
  const [items, setItems] = useState<NearbyItem[]>([]); const [pos, setPos] = useState<{lat:number,lng:number}|null>(null)
  const [logsByUser, setLogsByUser] = useState<Record<string,string[]>>({}); const [countByUser, setCountByUser] = useState<Record<string,number>>({})

  useEffect(()=>{ if(navigator.geolocation){ navigator.geolocation.getCurrentPosition((p)=>{ setPos({lat:p.coords.latitude, lng:p.coords.longitude}) }, ()=>{}, { enableHighAccuracy:true, maximumAge:30000, timeout:5000 }) } }, [])

  useEffect(()=>{
    const run = async ()=>{
      const res = await fetch(`/api/nearby?city=${encodeURIComponent(city)}&sort=${sort}`); const data = await res.json(); setItems(data.items||[])
      const { data: prices } = await supabase.from('prices').select('user_id, created_at').gte('created_at', new Date(Date.now()-1000*60*60*24*120).toISOString())
      const byUser:Record<string,string[]> = {}; const counts:Record<string,number> = {}
      ;(prices||[]).forEach(p=>{ if(!p.user_id) return; byUser[p.user_id]=byUser[p.user_id]||[]; byUser[p.user_id].push(p.created_at); counts[p.user_id]=(counts[p.user_id]||0)+1 })
      setLogsByUser(byUser); setCountByUser(counts)
    }
    run()
  }, [city, sort])

  const itemsWithDistance = useMemo(()=>{
    if (!pos) return items
    const d = (a:{lat:number,lng:number}, b:{lat:number,lng:number}) => {
      const R = 6371; const dLat=(b.lat-a.lat)*Math.PI/180; const dLng=(b.lng-a.lng)*Math.PI/180
      const lat1=a.lat*Math.PI/180; const lat2=b.lat*Math.PI/180
      const x=Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2
      return 2*R*Math.asin(Math.sqrt(x))
    }
    return items.map(it=> ({...it, distance: d(pos, {lat: it.venue.lat, lng: it.venue.lng})}))
  }, [items, pos])

  const filtered = itemsWithDistance.filter(it => {
    if (!q) return true; const h = `${it.venue.name} ${it.venue.address} ${it.venue.city}`.toLowerCase(); return h.includes(q.toLowerCase())
  }).sort((a,b)=>{
    if (sort==='cheap') { const pa=a.deal?.price_sek ?? Infinity; const pb=b.deal?.price_sek ?? Infinity; return pa-pb }
    if (sort==='nearby') return (a.distance ?? Infinity) - (b.distance ?? Infinity)
    return 0
  })

  const thisMonday = new Date(); const day = thisMonday.getDay(); const diff = (day+6)%7
  thisMonday.setDate(thisMonday.getDate()-diff); thisMonday.setHours(0,0,0,0)
  const weekly = Object.entries(logsByUser).map(([user, dates])=>({ user, count: dates.filter(d=> new Date(d) >= thisMonday).length })).sort((a,b)=> b.count - a.count).slice(0,5)

  useEffect(()=>{
    const start = async ()=>{
      try { Notification.requestPermission().catch(()=>{}) } catch {}
      const ch = supabase.channel('prices-insert').on('postgres_changes', { event:'INSERT', schema:'public', table:'prices' }, (payload)=>{
        const p:any = payload.new
        if (p.price_sek != null && p.price_sek <= 39) { const txt = t('Nytt fynd under 39 kr!','New deal under 39 SEK!'); try { new Notification('Ölradar', { body: txt }) } catch {} }
      }).subscribe()
      return ()=>{ supabase.removeChannel(ch) }
    }
    const end = start(); return ()=>{ end?.then(()=>{}).catch(()=>{}) }
  }, [])

  return (
    <main className="space-y-6">
      <FadeIn>
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div><h2 className="text-2xl font-semibold">{t('Hitta ölfynd','Find beer deals')}</h2><p className="text-white/70">{t('Snabb, snygg och mobilvänlig.','Fast, pretty and mobile-first.')}</p></div>
          <div className="flex gap-2">
            <BellButton onClick={()=>{ try { Notification.requestPermission().then(()=> alert(t('Jag pingar när ett fynd dyker upp.','I\'ll ping you when a new deal appears.'))) } catch {} }}/>
            <ShareButton title="Ölradar" text={t('Kolla denna ölradar!','Check out this beer radar!')}/>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid md:grid-cols-[1fr_auto_auto] gap-3">
          <input placeholder={t('Sök stad eller ställe…','Search city or venue…')} className="card-glass px-4 py-3 text-sm w-full outline-none" value={q} onChange={e=> setQ(e.target.value)}/>
          <select className="card-glass px-3 py-3 text-sm" value={city} onChange={e=> setCity(e.target.value as any)}>{cities.map(c=> <option key={c}>{c}</option>)}</select>
          <select className="card-glass px-3 py-3 text-sm" value={sort} onChange={e=> setSort(e.target.value as any)}>
            <option value="standard">{t('Standard','Standard')}</option><option value="cheap">{t('Billigast','Cheapest')}</option><option value="nearby">{t('Närmast','Nearby')}</option>
          </select>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(({venue, deal, distance})=>{
            const happy = isHappyHourNow(venue.hours) || (deal?.price_sek ?? 999) <= 39
            const styleHue = deal?.beer?.style?.includes('IPA') ? 'from-emerald-500' : deal?.beer?.style?.includes('Lager') ? 'from-amber-500' : 'from-indigo-500'
            return (
              <div key={venue.id} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${styleHue} to-transparent`}></div>
                <div className="p-4 flex gap-3">
                  <div className="w-28 h-28 relative rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <Image src={deal?.photo_url || '/beer-fallback.png'} alt={venue.name} fill sizes="112px" className="object-cover"/>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{venue.name}</h3>
                      {happy && <Chip>⚡ {t('Happy Hour','Happy Hour')}</Chip>}
                      {venue.open_now && <Chip>🟢 {t('Öppet','Open')}</Chip>}
                      {typeof distance==='number' && <Chip>🗺️ {distance.toFixed(1)} km</Chip>}
                    </div>
                    <p className="text-white/70 text-sm flex items-center gap-1 mt-1">{venue.address}, {venue.city}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="text-lg font-bold">{deal?.price_sek != null ? `${deal.price_sek.toFixed(0)} SEK` : '—'}</div>
                      {deal?.rating != null && (<span className="inline-flex items-center gap-1 text-sm"><Star size={14}/> {deal.rating.toFixed(1)}</span>)}
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    className="card-glass px-3 py-2 text-sm inline-flex items-center gap-2"
                    onClick={()=>{
                      const el = document.getElementById('log-modal') as HTMLDialogElement | null
                      el?.showModal()
                    }}
                  >
                    <Camera size={16}/> {t('Logga öl','Log beer')}
                  </button>
                </div>
              </div>
            )
          })}
        </section>
      </FadeIn>

      <FadeIn delay={0.15}>
        <section className="grid md:grid-cols-3 gap-4">
          <HypeCard>
            <h4 className="font-semibold">{t('Din nivå','Your level')}</h4>
            {(() => {
              const me = Object.keys(countByUser)[0]; const count = me ? countByUser[me] : 0
              const xp = xpForLogs(count); const badge = badgeForCount(count); const streak = streakFromDates(logsByUser[me] || [])
              return (<div className="mt-2 space-y-1">
                <TrophyPill points={xp} />
                <div className="text-sm text-white/80">{t('Loggar','Logs')}: {count}</div>
                <div className="text-sm text-white/80">{t('Streak','Streak')}: {streak} {t('dagar','days')}</div>
                {badge && <div className="text-sm mt-1">🎖️ {badge}</div>}
              </div>)
            })()}
          </HypeCard>
          <HypeCard>
            <h4 className="font-semibold">{t('Top Hunters denna vecka','Top Hunters this week')}</h4>
            <ol className="mt-2 space-y-1 list-decimal pl-5">
              {weekly.map((r,i)=>(<li key={r.user} className="text-sm flex justify-between"><span className="text-white/80">#{i+1} {r.user.slice(0,6)}</span><span className="font-medium">{r.count} {t('loggar','logs')}</span></li>))}
            </ol>
          </HypeCard>
          <HypeCard>
            <h4 className="font-semibold">{t('Tips','Tips')}</h4>
            <p className="text-sm text-white/80 mt-2">{t('Få en streak med en snabb lunchlogg.','Keep your streak with a quick lunch log.')}</p>
          </HypeCard>
        </section>
      </FadeIn>

      <dialog id="log-modal" className="backdrop:bg-black/50 rounded-2xl p-0">
        <form action="/api/log" method="post" encType="multipart/form-data" className="p-4 space-y-3 bg-neutral-900 rounded-2xl w-[min(520px,90vw)]">
          <h4 className="text-lg font-semibold">{t('Logga en öl','Log a beer')}</h4>
          <input name="venue_name" placeholder={t('Ställe…','Venue…')} required className="card-glass px-3 py-2 w-full"/>
          <input name="beer_name" placeholder={t('Öl…','Beer…')} required className="card-glass px-3 py-2 w-full"/>
          <div className="grid grid-cols-3 gap-2">
            <input name="price_sek" type="number" step="1" placeholder="SEK" required className="card-glass px-3 py-2 w-full"/>
            <input name="rating" type="number" step="0.1" min="0" max="5" placeholder={t('Betyg','Rating')} className="card-glass px-3 py-2 w-full"/>
            <input name="city" placeholder={t('Stad','City')} className="card-glass px-3 py-2 w-full"/>
          </div>
          <input name="photo" type="file" accept="image/*" className="w-full"/>
          <div className="flex justify-end gap-2">
            <button type="button" className="px-3 py-2" onClick={()=> (document.getElementById('log-modal') as HTMLDialogElement).close()}>{t('Avbryt','Cancel')}</button>
            <button className="card-glass px-3 py-2" onClick={()=> setTimeout(()=> fireConfetti(), 200)}>{t('Spara','Save')}</button>
          </div>
        </form>
      </dialog>
    </main>
  )
}
