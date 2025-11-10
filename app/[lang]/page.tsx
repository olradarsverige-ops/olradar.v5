'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '../../lib/supabaseClient';
import { FadeIn, HypeCard, Chip, TrophyPill, BellButton, ShareButton } from '../../components/ui';
import { MapPin, Camera, Star, Plus, Beer } from 'lucide-react';
import { badgeForCount, streakFromDates, isHappyHourNow } from '../../lib/game';
import { fireConfetti } from '../../components/confetti';
import { CITY_COORDS, CityKey } from '../../lib/cities';

type Venue = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  open_now: boolean;
  hours: any;
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

const cities: CityKey[] = ['Helsingborg', 'Stockholm', 'Göteborg', 'Malmö'];
const beerStyles = [
  'Lager','IPA','APA','DIPA','NEIPA','Pilsner','Porter','Stout','Sour',
  'Wheat','Belgian Ale','Brown Ale','Red Ale','Pale Ale','Kölsch','Vienna Lager'
] as const;

export default function LangPage() {
  const params = useParams<{ lang: string }>();
  const lang = ((params && (params as any).lang) || 'sv') as 'sv' | 'en';
  const t = (sv: string, en: string) => (lang === 'sv' ? sv : en);

  // Persist city (default Helsingborg)
  const [city, setCity] = useState<CityKey>('Helsingborg');
  useEffect(() => {
    try {
      const stored = localStorage.getItem('olradar.city');
      if (stored && (cities as readonly string[]).includes(stored)) {
        setCity(stored as CityKey);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('olradar.city', city);
    } catch {}
  }, [city]);

  const [q, setQ] = useState<string>('');
  const [sort, setSort] = useState<'standard' | 'cheap' | 'nearby'>('standard');
  const [items, setItems] = useState<NearbyItem[]>([]);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);

  // Modal refs
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const venueInputRef = useRef<HTMLInputElement | null>(null);
  const beerNameRef = useRef<HTMLInputElement | null>(null);

  const [venueOptions, setVenueOptions] = useState<string[]>([]);
  const [logsByUser, setLogsByUser] = useState<Record<string, string[]>>({});
  const [countByUser, setCountByUser] = useState<Record<string, number>>({});

  // Geolocation with fallback to city
  useEffect(() => {
    let canceled = false;
    const fallback = () => {
      if (!canceled) setPos(CITY_COORDS[city]);
    };
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          if (!canceled) setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        },
        () => fallback(),
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 4000 }
      );
    } else {
      fallback();
    }
    return () => {
      canceled = true;
    };
  }, [city]);

  const fetchNearby = useCallback(async () => {
    const res = await fetch(`/api/nearby?city=${encodeURIComponent(city)}&sort=${sort}`);
    const data = await res.json();
    setItems((data && data.items) || []);

    try {
      const r = await fetch(`/api/venues?city=${encodeURIComponent(city)}`);
      const v = await r.json();
      setVenueOptions(((v && v.venues) || []).map((x: any) => x.name));
    } catch {}

    const { data: prices } = await supabase
      .from('prices')
      .select('user_id, created_at')
      .gte('created_at', new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString());
    const byUser: Record<string, string[]> = {};
    const counts: Record<string, number> = {};
    (prices || []).forEach((p: any) => {
      if (!p.user_id) return;
      byUser[p.user_id] = byUser[p.user_id] || [];
      byUser[p.user_id].push(p.created_at);
      counts[p.user_id] = (counts[p.user_id] || 0) + 1;
    });
    setLogsByUser(byUser);
    setCountByUser(counts);
  }, [city, sort]);

  useEffect(() => {
    fetchNearby();
  }, [fetchNearby]);

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

  // weekly leaderboard
  const thisMonday = new Date();
  const day = thisMonday.getDay();
  const diff = (day + 6) % 7;
  thisMonday.setDate(thisMonday.getDate() - diff);
  thisMonday.setHours(0, 0, 0, 0);
  const weekly = Object.entries(logsByUser)
    .map(([user, dates]) => {
      const count = dates.filter((d) => new Date(d) >= thisMonday).length;
      return { user, count, xp: count * 10 };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  useEffect(() => {
    const start = async () => {
      try {
        if (typeof Notification !== 'undefined') {
          Notification.requestPermission().catch(() => {});
        }
      } catch {}
      const ch = supabase
        .channel('prices-insert')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prices' }, (payload: any) => {
          const p: any = payload.new;
          if (p.price_sek != null && p.price_sek <= 39) {
            const txt = t('Nytt fynd under 39 kr!', 'New deal under 39 SEK!');
            try {
              if (typeof Notification !== 'undefined') new Notification('Ölradar', { body: txt });
            } catch {}
          }
        })
        .subscribe();
      return () => {
        supabase.removeChannel(ch);
      };
    };
    const end = start();
    return () => {
      Promise.resolve(end).catch(() => {});
    };
  }, []);

  function openModal(prefillVenue?: string) {
    const el = modalRef.current;
    if (!el) return;
    const anyEl: any = el as any;
    if (typeof anyEl.showModal === 'function') {
      try {
        anyEl.showModal();
      } catch {
        el.setAttribute('open', '');
      }
    } else {
      el.setAttribute('open', '');
    }
    if (prefillVenue && venueInputRef.current) {
      venueInputRef.current.value = prefillVenue;
      window.setTimeout(() => {
        if (beerNameRef.current) beerNameRef.current.focus();
      }, 50);
    }
  }

  function closeModal() {
    const el = modalRef.current;
    if (!el) return;
    const anyEl: any = el as any;
    if (typeof anyEl.close === 'function') {
      try {
        anyEl.close();
      } catch {
        el.removeAttribute('open');
      }
    } else {
      el.removeAttribute('open');
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    fd.set('city', city);
    try {
      const res = await fetch('/api/log', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('bad status');
      closeModal();
      window.setTimeout(() => fireConfetti(), 100);
      await fetchNearby();
    } catch (err) {
      alert(t('Något gick fel när loggen skulle sparas.', 'Something went wrong while saving.'));
    }
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
            <BellButton
              onClick={() => {
                try {
                  if (typeof Notification !== 'undefined') {
                    Notification.requestPermission().then(() => alert(t('Jag pingar när ett fynd dyker upp.', 'I will ping you when a new deal appears.')));
                  }
                } catch {}
              }}
            />
            <ShareButton title="Ölradar" text={t('Kolla denna ölradar!', 'Check out this beer radar!')} />
            <button type="button" className="btn-primary" onClick={() => openModal()}>
              <Plus size={18} /> {t('Logga öl', 'Log beer')}
            </button>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid md:grid-cols-[1fr_auto_auto] gap-3 items-end">
          <div>
            <label className="label">{t('Sök', 'Search')}</label>
            <input
              placeholder={t('Sök stad eller ställe…', 'Search city or venue…')}
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div>
            <label className="label">{t('Stad', 'City')}</label>
            <input list="city-list" className="input" value={city} onChange={(e) => setCity(e.target.value as CityKey)} />
            <datalist id="city-list">{cities.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div>
            <label className="label">{t('Sortering', 'Sort')}</label>
            <select className="card-select" value={sort} onChange={(e) => setSort(e.target.value as any)}>
              <option value="standard">{t('Standard', 'Standard')}</option>
              <option value="cheap">{t('Billigast', 'Cheapest')}</option>
              <option value="nearby">{t('Närmast', 'Nearby')}</option>
            </select>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(({ venue, deal, distance }) => {
            const priceNum = deal && typeof deal.price_sek === 'number' ? (deal.price_sek as number) : null;
            const happy = isHappyHourNow(venue.hours) || (priceNum !== null ? priceNum : 999) <= 39;
            const styleHue =
              deal && deal.beer && deal.beer.style && deal.beer.style.includes('IPA')
                ? 'from-emerald-500'
                : deal && deal.beer && deal.beer.style && deal.beer.style.includes('Lager')
                ? 'from-amber-500'
                : 'from-indigo-500';
            return (
              <div key={venue.id} className="relative overflow-hidden rounded-2xl border border-white/14 bg-white/5">
                <div className={`absolute inset-0 opacity-20 overlay-safe bg-gradient-to-br ${styleHue} to-transparent`}></div>
                <div className="p-4 flex gap-3">
                  <div className="w-28 h-28 relative rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <Image src={(deal && deal.photo_url) || '/beer-fallback.png'} alt={venue.name} fill sizes="112px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{venue.name}</h3>
                      {happy && <Chip>⚡ {t('Happy Hour', 'Happy Hour')}</Chip>}
                      {venue.open_now && <Chip>🟢 {t('Öppet', 'Open')}</Chip>}
                      {typeof distance === 'number' && <Chip>🗺️ {distance.toFixed(1)} km</Chip>}
                    </div>
                    <p className="text-white/85 text-sm flex items-center gap-1 mt-1">
                      <MapPin size={14} /> {venue.address}, {venue.city}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="text-lg font-bold">{priceNum !== null ? `${(priceNum as number).toFixed(0)} SEK` : '—'}</div>
                      {deal && deal.rating != null && (
                        <span className="inline-flex items-center gap-1 text-sm">
                          <Star size={14} /> {(deal.rating as number).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 flex gap-2">
                  <button type="button" className="btn" onClick={() => openModal(venue.name)}>
                    <Camera size={16} /> {t('Logga öl', 'Log beer')}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </FadeIn>

      <button type="button" className="btn-primary fab" onClick={() => openModal()}>
        <Beer size={18} /> {t('Logga', 'Log')}
      </button>

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
              <div>
                <label className="label">SEK</label>
                <input name="price_sek" type="number" step="1" placeholder="SEK" required className="input"/>
              </div>
              <div>
                <label className="label">{t('Betyg','Rating')}</label>
                <input name="rating" type="number" step="0.1" min={0} max={5} placeholder="0–5" className="input"/>
              </div>
              <div>
                <label className="label">{t('Stad','City')}</label>
                <input name="city" value={city} onChange={() => {}} className="input"/>
              </div>
            </div>

            <div>
              <label className="label">{t('Foto (frivilligt)','Photo (optional)')}</label>
              <input name="photo" type="file" accept="image/*" className="w-full"/>
            </div>
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
