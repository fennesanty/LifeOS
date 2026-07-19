import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/routeAuth";
import { supabaseServer } from "@/lib/supabase/server";
import { localDateKey } from "@/lib/date";

const USER_ID = process.env.USER_ID || "default";

export async function GET(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") || 30);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const supa = supabaseServer();
  const { data, error } = await supa
    .from("daily_logs")
    .select("log_date, notes")
    .eq("user_id", USER_ID)
    .gte("log_date", localDateKey(since));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const byDate: Record<string, { done: string[]; total: number }> = {};
  for (const row of data ?? []) {
    try {
      const notes = JSON.parse(row.notes || "{}");
      if (notes.habits) byDate[row.log_date] = notes.habits;
    } catch {
      // skip malformed rows
    }
  }
  return NextResponse.json({ habits: byDate });
}
