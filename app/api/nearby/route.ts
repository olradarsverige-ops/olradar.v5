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

type Price = {
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
};

type Beer = { id: string; name: string | null; style: string | null; abv: number | null };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = (searchParams.get('city') || '').toString();

    // 1) fetch venues (optionally by city)
    let vq = supabase.from('venues').select('*');
    if (city) vq = vq.eq('city', city);
    const { data: venues, error: vErr } = await vq;
    if (vErr) throw vErr;

    if (!venues || venues.length === 0) {
      return NextResponse.json({ items: [] }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const venueIds = (venues as Venue[]).map(v => v.id);

    // 2) fetch recent prices for these venues in one go, newest first
    const { data: prices, error: pErr } = await supabase
      .from('prices')
      .select('id, created_at, price_sek, price_original, currency, rating, user_id, photo_url, venue_id, beer_id, verified')
      .in('venue_id', venueIds)
      .order('created_at', { ascending: false });
    if (pErr) throw pErr;

    // pick latest price per venue
    const latestByVenue = new Map<string, Price>();
    (prices || []).forEach((pr: any) => {
      if (!latestByVenue.has(pr.venue_id)) latestByVenue.set(pr.venue_id, pr);
    });

    // 3) fetch beers for used beer_ids (in bulk), build map
    const beerIds = Array.from(new Set((prices || []).map((p: any) => p.beer_id).filter(Boolean)));
    let beerMap = new Map<string, Beer>();
    if (beerIds.length) {
      const { data: beers, error: bErr } = await supabase
        .from('beers')
        .select('id, name, style, abv')
        .in('id', beerIds as string[]);
      if (bErr) throw bErr;
      (beers || []).forEach((b: any) => beerMap.set(b.id, b));
    }

    const items = (venues as Venue[]).map((v) => {
      const deal = latestByVenue.get(v.id) || null;
      const beer = deal?.beer_id ? beerMap.get(deal.beer_id) || null : null;
      return { venue: v, deal: deal ? { ...deal, beer } : null };
    });

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
