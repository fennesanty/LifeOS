import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/routeAuth";
import { getDailyNotes, mergeDailyNotes } from "@/lib/dailyLog";
import { localDateKey } from "@/lib/date";

function mondayOfThisWeek(): string {
  const d = new Date();
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return localDateKey(d);
}

const EMPTY_REVIEW = {
  wins: "",
  slipped: "",
  open_loops: "",
  follow_up: "",
  content_shipped: "",
  health_pattern: "",
  next_week: "",
  sealed: false,
};

export async function GET(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const weekKey = mondayOfThisWeek();
  const notes = await getDailyNotes(weekKey);
  return NextResponse.json({ weekKey, review: { ...EMPTY_REVIEW, ...(notes.review as object ?? {}) } });
}

export async function POST(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const weekKey = mondayOfThisWeek();
  const review = { ...EMPTY_REVIEW, ...body };
  await mergeDailyNotes(weekKey, { review });
  return NextResponse.json({ weekKey, review });
}
