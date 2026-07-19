import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/routeAuth";
import { getDailyNotes, mergeDailyNotes } from "@/lib/dailyLog";
import { localDateKey } from "@/lib/date";

const FINANCE_SENTINEL = "1900-01-02";

export async function GET(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const notes = await getDailyNotes(FINANCE_SENTINEL);
  return NextResponse.json({
    finance: notes.finance ?? { net_worth: 0, daily: 0, monthly: 0, currency: "EUR", as_of: null },
  });
}

export async function POST(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const finance = {
    net_worth: Number(body.net_worth) || 0,
    daily: Number(body.daily) || 0,
    monthly: Number(body.monthly) || 0,
    currency: body.currency || "EUR",
    as_of: localDateKey(),
  };
  await mergeDailyNotes(FINANCE_SENTINEL, { finance });
  return NextResponse.json({ finance });
}
