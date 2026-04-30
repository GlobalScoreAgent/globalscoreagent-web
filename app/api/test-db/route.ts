import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL?.replace('db.', 'db-') + '&options=-c%20sslmode=require',
  ssl: { rejectUnauthorized: false },
  // Forzar IPv4
  keepAlive: true,
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time, version()');
    client.release();

    return NextResponse.json({
      success: true,
      message: "✅ Conexión exitosa",
      time: result.rows[0].time,
    });
  } catch (error: any) {
    console.error("Error completo:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack?.substring(0, 500)
    }, { status: 500 });
  }
}