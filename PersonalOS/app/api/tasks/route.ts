import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/routeAuth";
import { supabaseServer } from "@/lib/supabase/server";

const USER_ID = process.env.USER_ID || "default";

export async function GET(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "open";
  const supa = supabaseServer();
  let query = supa.from("tasks").select("*").eq("user_id", USER_ID);
  query = status === "done" ? query.not("completed_at", "is", null) : query.is("completed_at", null);

  const { data, error } = await query.order("priority_score", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tasks: data ?? [] });
}

export async function POST(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const supa = supabaseServer();
  const { data, error } = await supa
    .from("tasks")
    .insert({
      user_id: USER_ID,
      title: body.title,
      description: body.description ?? null,
      urgency: body.urgency ?? "someday",
      key: !!body.key,
      priority_score: body.priority_score ?? Date.now(),
      tags: body.tags ?? [],
      due_date: body.due_date ?? null,
      owner: body.owner ?? null,
      entity_id: body.entity_id ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}
