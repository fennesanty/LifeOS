import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/routeAuth";
import { getHabitConfig, HABIT_CONFIG_SENTINEL } from "@/lib/habitConfig";
import { mergeDailyNotes } from "@/lib/dailyLog";

export async function GET(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const habits = await getHabitConfig();
  return NextResponse.json({ habits });
}

export async function POST(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.habits)) return NextResponse.json({ error: "habits must be an array" }, { status: 400 });
  await mergeDailyNotes(HABIT_CONFIG_SENTINEL, { habit_config: body.habits });
  return NextResponse.json({ habits: body.habits });
}
