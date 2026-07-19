import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/routeAuth";
import { supabaseServer } from "@/lib/supabase/server";

const USER_ID = process.env.USER_ID || "default";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of ["title", "description", "urgency", "key", "priority_score", "tags", "due_date", "owner", "entity_id"]) {
    if (field in body) patch[field] = body[field];
  }
  if ("completed" in body) {
    patch.completed_at = body.completed ? new Date().toISOString() : null;
  }

  const supa = supabaseServer();
  const { data, error } = await supa.from("tasks").update(patch).eq("id", id).eq("user_id", USER_ID).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const supa = supabaseServer();
  const { error } = await supa.from("tasks").delete().eq("id", id).eq("user_id", USER_ID);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
