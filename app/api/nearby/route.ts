// app/api/nearby/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

type Venue = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country?: string | null;
  lat?: number | null;
  lng?: number | null;
  open_now?: boolean | null;
  hours?: any;
};

type PriceRow = {
  id: string;
  created_at: string;
  price_sek: number | null;
  price_original: number | null;
  currency: string | null;
  rating: number | null;
  user_id: string | null;
  photo_url: string | null;
  venue_id: string;
  beer_id: string | null;
  verified?: boolean | null;
  // Supabase join kan vara objekt ELLER array – vi hanterar båda
  beers?: { name: string | null; style: string | null; abv: number | null } | Array<{ name: string | null; style: string | null; abv: number | null }> | null;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = (searchParams.get('city') || '').toString();

    // 1) hämta venues (filtrera på city om skickad)
    let vq = supabase.from('venues').select('*');
    if (city) vq = vq.eq('city', city);
    const { data: venues, error: vErr } = await vq;
    if (vErr) throw vErr;

    // 2) senaste pris per venue – oavsett verified
    const items: Array<{ venue: Venue; deal: any | null }> = [];

    for (const v of (venues || []) as Venue[]) {
      const { data: price, error: pErr } = await supabase
        .from('prices')
        .select(
          // join på beers; Supabase kan returnera array beroende på relation/nycklar
          'id, created_at, price_sek, price_original, currency, rating, user_id, photo_url, venue_id, beer_id, verified, beers(name, style, abv)'
        )
        .eq('venue_id', v.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle<PriceRow>();
      if (pErr) throw pErr;

      let beer: { name: string | null; style: string | null; abv: number | null } | null = null;
      if (price && price.beers) {
        if (Array.isArray(price.beers)) {
          beer = price.beers.length ? price.beers[0] : null;
        } else {
          beer = price.beers;
        }
      }

      items.push({
        venue: v,
        deal: price
          ? {
              id: price.id,
              created_at: price.created_at,
              price_sek: price.price_sek,
              price_original: price.price_original,
              currency: price.currency,
              rating: price.rating,
              user_id: price.user_id,
              photo_url: price.photo_url,
              venue_id: price.venue_id,
              beer_id: price.beer_id,
              verified: price.verified ?? null,
              beer, // normaliserat objekt
            }
          : null,
      });
    }

    return NextResponse.json(
      { items },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err) {
    console.error('nearby GET error', err);
    return NextResponse.json(
      { items: [] },
      { headers: { 'Cache-Control': 'no-store' }, status: 200 }
    );
  }
}
