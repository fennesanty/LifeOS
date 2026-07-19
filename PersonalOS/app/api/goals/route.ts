import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/routeAuth";
import { getDailyNotes, mergeDailyNotes, GOALS_SENTINEL_DATE } from "@/lib/dailyLog";

export async function GET(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const notes = await getDailyNotes(GOALS_SENTINEL_DATE);
  return NextResponse.json({
    week: notes.goals_week_items ?? [],
    month: notes.goals_month_items ?? [],
  });
}

export async function POST(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (body?.scope !== "week" && body?.scope !== "month") {
    return NextResponse.json({ error: "scope must be 'week' or 'month'" }, { status: 400 });
  }
  const key = body.scope === "week" ? "goals_week_items" : "goals_month_items";
  const notes = await mergeDailyNotes(GOALS_SENTINEL_DATE, { [key]: body.items ?? [] });
  return NextResponse.json({ week: notes.goals_week_items ?? [], month: notes.goals_month_items ?? [] });
}
