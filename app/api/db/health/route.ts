import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await sql`SELECT 1 as ok`;
    const isConnected = result[0]?.ok === 1;

    if (!isConnected) {
      return Response.json({ ok: false }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
