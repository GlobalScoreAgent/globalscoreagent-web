import { NextResponse } from 'next/server';

/** Dashboard WAMI detail is Coming Soon — no data served. */
export async function GET() {
  return NextResponse.json({ error: 'wami_coming_soon' }, { status: 404 });
}
