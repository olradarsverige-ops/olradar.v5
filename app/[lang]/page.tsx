'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

// relative imports only (no "@/")
import { supabase } from '../../lib/supabaseClient';
import { FadeIn, Chip, BellButton, ShareButton } from '../../components/ui';
import { MapPin, Camera, Star, Plus, Beer, ChevronDown } from 'lucide-react';
import { isHappyHourNow } from '../../lib/game';
import { fireConfetti } from '../../components/confetti';
import { CITY_COORDS, CityKey } from '../../lib/cities';

/** Types */
type Venue = {
  id: string;
  name: string;
  address: string;
  city: string;
  country?: string;
  lat: number;
  lng: number;
  open_now?: boolean | null;
  hours?: any;
};

type Deal = {
  id: string;
  price_sek: number | null;
  price_original: number | null;
  currency: string | null;
  rating: number | null;
  user_id: string | null;
  photo_url: string | null;
  created_at: string;
  venue_id: string;
  beer_id: string | null;
  beer?: { name: string; style: string | null; abv: number | null } | null;
};

type NearbyItem = { venue: Venue; deal: Deal | null; distance?: number };

/** Constants */
const cities: CityKey[] = ['Helsingborg', 'Stockholm', 'Göteborg', 'Malmö'];
const beerStyles = ['Lager','IPA','APA','DIPA','NEIPA','Pilsner','Porter','Stout','Sour','Wheat','Belgian Ale','Brown Ale','Red Ale','Pale Ale','Kölsch','Vienna Lager'] as const;

/** Helpers */
function swedenNow(): Date {
  try {
    const fmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour12: false, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'});
    const parts = fmt.formatToParts(new Date()).reduce<Record<string,string>>((acc,p)=>{acc[p.type]=p.value;return acc;},{});
    return new Date(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`);
  } catch {
    return new Date();
  }
}

function isOpenNowFromHours(hours:any): boolean | null {
  if (!hours) return null;
  try {
    const now = swedenNow();
    const day = now.getDay(); // 0-6
    const map:any = {0:'sun',1:'mon',2:'tue',3:'wed',4:'thu',5:'fri',6:'sat'};
    const key = map[day];
    const ranges = hours[key] || hours[key?.toUpperCase?.()] || hours[key?.toLowerCase?.()];
    if (!ranges || !Array.isArray(ranges)) return null;
    const mins = now.getHours()*60 + now.getMinutes();
    for (const r of ranges) {
      if (!r) continue;
      const [from,to] = (r.time || r).split('-');
      const [fh,fm] = from.split(':').map((x:string)=>parseInt(x,10));
      const [th,tm] = to.split(':').map((x:string)=>parseInt(x,10));
      const a = fh*60+fm; const b = th*60+tm;
      if (a<=mins && mins<=b) return true;
    }
    return false;
  } catch { return null; }
}

/** Accessible, minimal custom select for Sortering */
function SortSelect({
  value, onChange, t
}: { value: 'standard'|'cheap'|'nearby'; onChange: (v:'standard'|'cheap'|'nearby')=>void; t:(sv:string,en:string)=>string }) {
  const [open,setOpen]=useState(false);
  const ref = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{
    const onDoc=(e:MouseEvent)=>{ if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown',onDoc); return ()=>document.removeEventListener('mousedown',onDoc);
  },[]);
  const items:(['standard'|'cheap'|'nearby',string,string])[] = [
    ['standard', t('Standard','Standard'),'standard'],
    ['cheap', t('Billigast','Cheapest'),'cheap'],
    ['nearby', t('Närmast','Nearby'),'nearby']
  ];
  const label = items.find(i=>i[0]===value)?.[1] || t('Standard','Standard');
  return (
    <div className="relative" ref={ref}>
      <button type="button" className="select-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={()=>setOpen(!open)}>
        {label} <ChevronDown size={16}/>
      </button>
      {open && (
        <div className="select-pop" role="listbox" aria-label={t('Sortering','Sort')}>
          {items.map(([v,text])=>(
            <div key={v} role="option" aria-selected={v===value} className="select-item" onClick={()=>{ onChange(v); setOpen(false); }}>
              {text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Page */
export default function LangPage() {
  const params = useParams<{ lang: string }>();
  const lang = ((params && (params as any).lang) || 'sv') as 'sv' | 'en';
  const t = (sv: string, en: string) => (lang === 'sv' ? sv : en);

  // City with persistence
  const [city, setCity] = useState<CityKey>('Helsingborg');
  useEffect(() => { try { const s = localStorage.getItem('olradar.city'); if (s && (cities as readonly string[]).includes(s)) setCity(s as CityKey); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem('olradar.city', city); } catch {} }, [city]);

  const [q, setQ] = useState<string>('');
  const [sort, setSort] = useState<'standard' | 'cheap' | 'nearby'>('standard');
  const [items, setItems] = useState<NearbyItem[]>([]);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);

  // Modal & form refs
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const venueInputRef = useRef<HTMLInputElement | null>(null);
  const beerNameRef = useRef<HTMLInputElement | null>(null);

  // Autocomplete lists
  const [venueOptions, setVenueOptions] = useState<string[]>([]);

  // Optimistic marker
  const [justLogged, setJustLogged] = useState<{ venue: string; price: number; style?: string; rating?: number } | null>(null);
  useEffect(()=>{ if(!justLogged) return; const id=window.setTimeout(()=>setJustLogged(null), 12000); return ()=>clearTimeout(id); },[justLogged]);

  // Geoposition → fallback to city coords
  useEffect(() => {
    let canceled = false;
    const fallback = () => { if (!canceled) setPos(CITY_COORDS[city]); };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => { if (!canceled) setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); },
        () => fallback(), { enableHighAccuracy: true, maximumAge: 30000, timeout: 4000 }
      );
    } else { fallback(); }
    return () => { canceled = true; };
  }, [city]);

  // Fetchers
  const fetchNearby = useCallback(async (cacheBust=false) => {
    const qs = cacheBust ? `&_=${Date.now()}` : '';
    const res = await fetch(`/api/nearby?city=${encodeURIComponent(city)}&sort=${sort}${qs}`);
    const data = await res.json();
    setItems((data && data.items) || []);

    try {
      const r = await fetch(`/api/venues?city=${encodeURIComponent(city)}`);
      const v = await r.json();
      setVenueOptions(((v && v.venues) || []).map((x: any) => x.name));
    } catch {}
  }, [city, sort]);

  useEffect(() => { fetchNearby(); }, [fetchNearby]);

  // Distances
  const itemsWithDistance = useMemo(() => {
    if (!pos) return items;
    const d = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
      const R = 6371;
      const dLat = ((b.lat - a.lat) * Math.PI) / 180;
      const dLng = ((b.lng - a.lng) * Math.PI) / 180;
      const lat1 = (a.lat * Math.PI) / 180;
      const lat2 = (b.lat * Math.PI) / 180;
      const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(x));
    };
    return items.map((it) => ({ ...it, distance: d(pos, { lat: it.venue.lat, lng: it.venue.lng }) }));
  }, [items, pos]);

  // Query + sort
  const filtered = itemsWithDistance
    .filter((it) => {
      if (!q) return true;
      const h = `${it.venue.name} ${it.venue.address} ${it.venue.city}`.toLowerCase();
      return h.includes(q.toLowerCase());
    })
    .sort((a, b) => {
      if (sort === 'cheap') {
        const pa = a.deal && a.deal.price_sek != null ? a.deal.price_sek : Number.POSITIVE_INFINITY;
        const pb = b.deal && b.deal.price_sek != null ? b.deal.price_sek : Number.POSITIVE_INFINITY;
        return (pa as number) - (pb as number);
      }
      if (sort === 'nearby') {
        return (a.distance || Number.POSITIVE_INFINITY) - (b.distance || Number.POSITIVE_INFINITY);
      }
      return 0;
    });

  // Modal controls
  function openModal(prefillVenue?: string) {
    const el = modalRef.current; if (!el) return;
    const anyEl: any = el as any;
    if (typeof anyEl.showModal === 'function') { try { anyEl.showModal(); } catch { el.setAttribute('open',''); } }
    else { el.setAttribute('open',''); }
    if (prefillVenue && venueInputRef.current) {
      venueInputRef.current.value = prefillVenue;
      window.setTimeout(() => { beerNameRef.current?.focus(); }, 50);
    }
  }
  function closeModal() {
    const el = modalRef.current; if (!el) return;
    const anyEl: any = el as any;
    if (typeof anyEl.close === 'function') { try { anyEl.close(); } catch { el.removeAttribute('open'); } }
    else { el.removeAttribute('open'); }
  }

  // Submit log
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current; if (!form) return;
    const fd = new FormData(form);
    const priceStr = (fd.get('price_sek') || '').toString().trim();
    const priceNum = Number(priceStr || '0');
    fd.set('price_original', priceStr);
    fd.set('currency', 'SEK');
    fd.set('verified', 'true');
    fd.set('city', city);
    try {
      const res = await fetch('/api/log', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('bad status');
      const venueName = (fd.get('venue_name') || '').toString();
      const style = (fd.get('beer_style') || '').toString();
      const rating = Number((fd.get('rating') || '').toString() || '0') || undefined;
      if (venueName && priceNum > 0) setJustLogged({ venue: venueName, price: priceNum, style, rating });
      closeModal();
      window.setTimeout(() => fireConfetti(), 80);
      await fetchNearby(true);
    } catch { alert(t('Något gick fel när loggen skulle sparas.', 'Something went wrong while saving.')); }
  }

  return (
    <main className="space-y-6">
      <FadeIn>
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{t('Hitta ölfynd', 'Find beer deals')}</h2>
            <p className="text-white/80">{t('Snabb, snygg och mobilvänlig.', 'Fast, pretty and mobile-first.')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <BellButton onClick={() => {
              try { if (typeof Notification !== 'undefined') { Notification.requestPermission().then(() => alert(t('Jag pingar när ett fynd dyker upp.', 'I will ping you when a new deal appears.'))); } } catch {}
            }}/>
            <ShareButton title="Ölradar" text={t('Kolla denna ölradar!', 'Check out this beer radar!')} />
            {/* Floating amber CTA */}
            <button type="button" className="btn-primary fab" onClick={() => openModal()}>
              <Plus size={18} /> {t('Logga öl', 'Log beer')}
            </button>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid md:grid-cols-[1fr_auto_auto] gap-3 items-end">
          <div>
            <label className="label">{t('Sök', 'Search')}</label>
            <input placeholder={t('Sök stad eller ställe…', 'Search city or venue…')} className="input" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div>
            <label className="label">{t('Stad', 'City')}</label>
            <input list="city-list" className="input" value={city} onChange={(e) => setCity(e.target.value as CityKey)} />
            <datalist id="city-list">{cities.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div>
            <label className="label">{t('Sortering', 'Sort')}</label>
            <SortSelect value={sort} onChange={(v)=>setSort(v)} t={t} />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(({ venue, deal, distance }) => {
            const optimistic = justLogged && justLogged.venue.toLowerCase() === venue.name.toLowerCase();
            const priceNum = optimistic ? justLogged!.price : (deal && typeof deal.price_sek === 'number' ? (deal.price_sek as number) : null);
            const computedOpen = isOpenNowFromHours(venue.hours);
            const showOpen = computedOpen === true; // only show when certain
            const happy = isHappyHourNow(venue.hours) || (priceNum !== null ? priceNum : 999) <= 39;

            return (
              <div key={venue.id} className="relative overflow-hidden rounded-2xl border border-white/14 bg-white/5">
                <div className="p-4 flex gap-3">
                  <div className="w-28 h-28 relative rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <Image src={(deal && deal.photo_url) || '/beer-fallback.png'} alt={venue.name} fill sizes="112px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{venue.name}</h3>
                      {showOpen && <Chip>🟢 {t('Öppet', 'Open')}</Chip>}
                      {typeof distance === 'number' && <Chip>🗺️ {distance.toFixed(1)} km</Chip>}
                      {happy && <Chip>⚡ {t('Happy Hour', 'Happy Hour')}</Chip>}
                      {optimistic && <Chip>✨ {t('Ny logg','New log')}</Chip>}
                    </div>
                    <p className="text-white/85 text-sm flex items-center gap-1 mt-1"><MapPin size={14} /> {venue.address}, {venue.city}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="text-lg font-bold">{priceNum !== null ? `${priceNum.toFixed(0)} SEK` : '—'}</div>
                      {deal && deal.rating != null && (<span className="inline-flex items-center gap-1 text-sm"><Star size={14} /> {(deal.rating as number).toFixed(1)}</span>)}
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 flex gap-2">
                  <button type="button" className="btn" onClick={() => openModal(venue.name)}><Camera size={16} /> {t('Logga öl', 'Log beer')}</button>
                </div>
              </div>
            );
          })}
        </section>
      </FadeIn>

      {/* Modal for logging */}
      <dialog id="log-modal" ref={modalRef} className="backdrop:bg-black/50 rounded-2xl p-0">
        <form ref={formRef} onSubmit={onSubmit} action="/api/log" method="post" encType="multipart/form-data" className="modal-surface w-[min(640px,95vw)]">
          <div className="modal-header">
            <div className="modal-title flex items-center gap-2"><Beer size={18}/> {t('Logga en öl','Log a beer')}</div>
            <button type="button" className="btn-ghost" onClick={closeModal}>✕</button>
          </div>
          <div className="modal-body space-y-4">
            <div>
              <label className="label">{t('Ställe','Venue')}</label>
              <input ref={venueInputRef} name="venue_name" list="venue-list" placeholder={t('Skriv eller välj…','Type or choose…')} required className="input"/>
              <datalist id="venue-list">{venueOptions.map((v) => <option key={v} value={v} />)}</datalist>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">{t('Öl (namn)','Beer (name)')}</label>
                <input ref={beerNameRef} name="beer_name" placeholder={t('Ex: Pilsner Urquell','e.g., Pilsner Urquell')} required className="input"/>
              </div>
              <div>
                <label className="label">{t('Stil','Style')}</label>
                <input name="beer_style" list="beer-style-list" placeholder={t('Välj eller skriv…','Choose or type…')} className="input"/>
                <datalist id="beer-style-list">{beerStyles.map((s) => <option key={s} value={s} />)}</datalist>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><label className="label">SEK</label><input name="price_sek" type="number" step="1" placeholder="SEK" required className="input"/></div>
              <div><label className="label">{t('Betyg','Rating')}</label><input name="rating" type="number" step="0.1" min={0} max={5} placeholder="0–5" className="input"/></div>
              <div><label className="label">{t('Stad','City')}</label><input name="city" value={city} onChange={()=>{}} className="input"/></div>
            </div>
            <div><label className="label">{t('Foto (frivilligt)','Photo (optional)')}</label><input name="photo" type="file" accept="image/*" className="w-full"/></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={closeModal}>{t('Avbryt','Cancel')}</button>
            <button type="submit" className="btn-primary">{t('Spara','Save')}</button>
          </div>
        </form>
      </dialog>
    </main>
  );
}
