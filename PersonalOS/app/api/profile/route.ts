import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/routeAuth";
import { getDailyNotes, mergeDailyNotes } from "@/lib/dailyLog";

const PROFILE_SENTINEL = "1900-01-03";
const EMPTY_PROFILE = { name: "Fenne Santy", city: "Kortrijk", focus: "Ship the dashboard", avatar_url: null as string | null };

export async function GET(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const notes = await getDailyNotes(PROFILE_SENTINEL);
  return NextResponse.json({ profile: { ...EMPTY_PROFILE, ...(notes.profile as object ?? {}) } });
}

export async function POST(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const notes = await getDailyNotes(PROFILE_SENTINEL);
  const prev = { ...EMPTY_PROFILE, ...(notes.profile as object ?? {}) };
  const profile = {
    name: body.name ?? prev.name,
    city: body.city ?? prev.city,
    focus: body.focus ?? prev.focus,
    avatar_url: body.avatar_url ?? prev.avatar_url,
  };
  await mergeDailyNotes(PROFILE_SENTINEL, { profile });
  return NextResponse.json({ profile });
}
