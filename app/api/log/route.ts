import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'photos'

const supabase = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })

export async function POST(req: Request) {
  try {
    const form = await req.formData()

    const venue_name = (form.get('venue_name') || '').toString().trim()
    const beer_name = (form.get('beer_name') || '').toString().trim()
    const beer_style = (form.get('beer_style') || '').toString().trim() || null
    const city = (form.get('city') || '').toString().trim()
    const price_sek_str = (form.get('price_sek') || '').toString().trim()
    const rating_str = (form.get('rating') || '').toString().trim()
    const rating = rating_str ? Number(rating_str) : null
    const price_sek = Number(price_sek_str || '0')
    const currency = 'SEK'

    if (!venue_name || !beer_name || !price_sek) {
      return NextResponse.json({ error: 'Bad form' }, { status: 400 })
    }

    // 1) Ensure venue exists (upsert by (name, city))
    let venueId: string | null = null
    {
      const { data: v1, error: vErr } = await supabase
        .from('venues')
        .select('id')
        .eq('name', venue_name)
        .eq('city', city)
        .limit(1)
        .maybeSingle()

      if (vErr) throw vErr

      if (v1?.id) {
        venueId = v1.id
      } else {
        const { data: v2, error: vInsErr } = await supabase
          .from('venues')
          .insert({ id: crypto.randomUUID(), name: venue_name, city })
          .select('id')
          .single()
        if (vInsErr) throw vInsErr
        venueId = v2.id
      }
    }

    // 2) Ensure beer exists (upsert by name)
    let beerId: string | null = null
    {
      const { data: b1, error: bErr } = await supabase
        .from('beers')
        .select('id')
        .eq('name', beer_name)
        .limit(1)
        .maybeSingle()
      if (bErr) throw bErr

      if (b1?.id) {
        beerId = b1.id
      } else {
        const { data: b2, error: bInsErr } = await supabase
          .from('beers')
          .insert({ id: crypto.randomUUID(), name: beer_name, style: beer_style })
          .select('id')
          .single()
        if (bInsErr) throw bInsErr
        beerId = b2.id
      }
    }

    // 3) Optional photo upload
    let photo_url: string | null = null
    const file = form.get('photo') as File | null
    if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
      const buf = Buffer.from(await file.arrayBuffer())
      const extGuess = (file.type && file.type.split('/')[1]) || 'jpg'
      const key = `prices/${Date.now()}-${Math.random().toString(36).slice(2)}.${extGuess}`
      const { data: u, error: uErr } = await supabase.storage.from(bucket).upload(key, buf, {
        contentType: file.type || 'image/jpeg',
        upsert: false
      })
      if (uErr) throw uErr
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(u.path)
      photo_url = pub.publicUrl || null
    }

    // 4) Insert price row (verified=true so it shows up in MVP views)
    const insertPayload: any = {
      id: crypto.randomUUID(),
      venue_id: venueId,
      beer_id: beerId,
      price_original: price_sek,
      currency,
      price_sek,
      rating,
      photo_url,
      verified: true
    }
    const { data: priceRow, error: pErr } = await supabase
      .from('prices')
      .insert(insertPayload)
      .select('id, created_at, price_sek, venue_id, beer_id, rating, photo_url')
      .single()
    if (pErr) throw pErr

    return NextResponse.json({ ok: true, price: priceRow }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    })
  } catch (err: any) {
    console.error('log POST error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
