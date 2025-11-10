import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(req: NextRequest){
  const city = req.nextUrl.searchParams.get('city')
  let q = supabase.from('venues').select('*').limit(100)
  if (city) q = q.eq('city', city)
  const { data } = await q
  return NextResponse.json({ venues: data||[] })
}
