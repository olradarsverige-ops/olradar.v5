import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = (searchParams.get('city') || '').toString();

    let q = supabase.from('venues').select('id, name, address, city, lat, lng, open_now, hours');
    if (city) q = q.eq('city', city);

    const { data, error } = await q;
    if (error) throw error;

    return NextResponse.json({ venues: data }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
  } catch (err) {
    console.error('venues GET error', err);
    return NextResponse.json({ venues: [] }, { headers: { 'Cache-Control': 'no-store' }, status: 200 });
  }
}
