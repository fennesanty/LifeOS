import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";
import { AUTH_COOKIE, checkApiSecret, verifySessionToken } from "@/lib/auth";

export async function GET(req: Request) {
  const apiSecret = req.headers.get("x-api-secret");
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  const authed = checkApiSecret(apiSecret) || (await verifySessionToken(token).catch(() => false));
  if (!authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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
