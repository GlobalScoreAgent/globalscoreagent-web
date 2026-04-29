import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return NextResponse.json({ 
      success: false, 
      error: "DATABASE_URL no está definida en este entorno" 
    }, { status: 500 });
  }

  return NextResponse.json({ 
    success: true, 
    message: "DATABASE_URL detectada",
    url_length: dbUrl.length,
    starts_with: dbUrl.substring(0, 50) + "..."
  });
}