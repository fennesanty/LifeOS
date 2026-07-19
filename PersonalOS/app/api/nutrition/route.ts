import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/routeAuth";
import { getDailyNotes, mergeDailyNotes, type Meal } from "@/lib/dailyLog";
import { localDateKey } from "@/lib/date";

export async function GET(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const notes = await getDailyNotes(localDateKey());
  return NextResponse.json({ meals: notes.nutrition?.meals ?? [] });
}

export async function POST(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const dateKey = localDateKey();
  const notes = await getDailyNotes(dateKey);
  const meals: Meal[] = notes.nutrition?.meals ?? [];

  const meal: Meal = {
    id: crypto.randomUUID(),
    t: new Date().toISOString().slice(11, 16),
    n: body.n || "Meal",
    kcal: Number(body.kcal) || 0,
    p: Number(body.p) || 0,
    c: Number(body.c) || 0,
    f: Number(body.f) || 0,
    estimated: !!body.estimated,
  };
  meals.push(meal);
  await mergeDailyNotes(dateKey, { nutrition: { meals } });
  return NextResponse.json({ meals });
}
