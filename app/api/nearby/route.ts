import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(req: NextRequest){
  const city = req.nextUrl.searchParams.get('city') || 'Stockholm'
  const sort = req.nextUrl.searchParams.get('sort') || 'standard'

  const { data: venues } = await supabase.from('venues').select('*').eq('city', city).limit(100)

  let items: any[] = []
  if (venues && venues.length){
    const ids = venues.map(v=> v.id)
    const { data: prices } = await supabase
      .from('prices')
      .select('*, beer:beers(name,style,abv)')
      .in('venue_id', ids)
      .order('created_at', { ascending: false })
      .limit(1, { foreignTable: 'prices' })
    const byVenue: Record<string, any> = {}
    ;(prices||[]).forEach(p=>{ if (!byVenue[p.venue_id]) byVenue[p.venue_id] = p })
    items = venues.map(v => ({ venue: v, deal: byVenue[v.id] || null }))
  }

  if (sort === 'cheap') items.sort((a,b)=> (a.deal?.price_sek ?? Infinity) - (b.deal?.price_sek ?? Infinity))
  return NextResponse.json({ items })
}
