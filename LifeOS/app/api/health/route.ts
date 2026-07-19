import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const envOk =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !!process.env.AUTH_SECRET &&
    !!process.env.DASHBOARD_PASSWORD;

  let dbOk = false;
  let dbError: string | null = null;
  try {
    const supa = supabaseServer();
    const { error } = await supa.from("entities").select("id").limit(1);
    dbOk = !error;
    dbError = error?.message ?? null;
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    ok: envOk && dbOk,
    envOk,
    dbOk,
    dbError,
    time: new Date().toISOString(),
  });
}
