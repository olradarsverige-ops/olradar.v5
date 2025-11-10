import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const city = (searchParams.get('city') || '').toString()
    const sort = (searchParams.get('sort') || 'standard') as 'standard'|'cheap'|'nearby'

    // 1) fetch venues by city
    let q = supabase.from('venues').select('*')
    if (city) q = q.eq('city', city)
    const { data: venues, error: vErr } = await q
    if (vErr) throw vErr

    // 2) for each venue, fetch latest price (verified or not — we want to show latest insert)
    const items: any[] = []
    for (const v of venues || []) {
      const { data: price, error: pErr } = await supabase
        .from('prices')
        .select('id, created_at, price_sek, price_original, currency, rating, user_id, photo_url, venue_id, beer_id, verified, beers(name, style, abv)')
        .eq('venue_id', v.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (pErr) throw pErr
      items.push({ venue: v, deal: price ? { ...price, beer: price.beers ? { name: price.beers.name, style: price.beers.style, abv: price.beers.abv } : null } : null })
    }

    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } })
  } catch (err: any) {
    console.error('nearby GET error', err)
    return NextResponse.json({ items: [] }, { headers: { 'Cache-Control': 'no-store' }, status: 200 })
  }
}
