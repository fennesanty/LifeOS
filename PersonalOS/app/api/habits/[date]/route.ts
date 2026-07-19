import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/routeAuth";
import { mergeDailyNotes } from "@/lib/dailyLog";

export async function POST(req: Request, { params }: { params: Promise<{ date: string }> }) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { date } = await params;
  const body = await req.json().catch(() => ({}));
  const done = Array.isArray(body.done) ? body.done : [];
  const total = typeof body.total === "number" ? body.total : done.length;

  const notes = await mergeDailyNotes(date, { habits: { done, total } });
  return NextResponse.json({ habits: notes.habits });
}
