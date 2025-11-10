import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'photos'

export async function POST(req: NextRequest){
  const form = await req.formData()
  const venue_name = String(form.get('venue_name')||'').trim()
  const beer_name = String(form.get('beer_name')||'').trim()
  const price_sek = Number(form.get('price_sek')||0)
  const rating = form.get('rating') ? Number(form.get('rating')) : null
  const city = String(form.get('city')||'')

  if (!venue_name || !beer_name || !price_sek) {
    return NextResponse.json({ ok:false, error:'Missing fields' }, { status: 400 })
  }

  let venueId: string | null = null
  const { data: v1 } = await supabase.from('venues').select('id').eq('name', venue_name).maybeSingle()
  if (v1) venueId = v1.id
  if (!venueId) {
    const id = crypto.randomUUID()
    await supabase.from('venues').insert({ id, name: venue_name, city, address: '', country: 'SE', lat: 59.33, lng: 18.07, open_now: true, hours: {} })
    venueId = id
  }

  let beerId: string | null = null
  const { data: b1 } = await supabase.from('beers').select('id').eq('name', beer_name).maybeSingle()
  if (b1) beerId = b1.id
  if (!beerId) {
    const id = crypto.randomUUID()
    await supabase.from('beers').insert({ id, name: beer_name, style: null, abv: null })
    beerId = id
  }

  let photo_url: string | null = null
  const photo = form.get('photo') as File | null
  if (photo && photo.size > 0) {
    const arrayBuffer = await photo.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const path = `photos/${Date.now()}-${photo.name}`
    const { data: up, error: upErr } = await supabase.storage.from(BUCKET).upload(path, bytes, {
      contentType: photo.type || 'image/jpeg', upsert: false
    })
    if (!upErr) {
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
      photo_url = pub.publicUrl
    }
  }

  const id = crypto.randomUUID()
  await supabase.from('prices').insert({
    id, venue_id: venueId, beer_id: beerId, price_original: price_sek, currency: 'SEK',
    price_sek, rating, user_id: null, photo_url, ocr_text: null, verified: false
  })

  return NextResponse.redirect(new URL(req.headers.get('referer') || '/', req.url), 303)
}
