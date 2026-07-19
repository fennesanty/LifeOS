import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { classifyCapture } from "@/lib/router/classifyCapture";
import { sendTelegramMessage } from "@/lib/telegram";
import { addHabit, removeHabit } from "@/lib/habitConfig";
import { mergeDailyNotes, GOALS_SENTINEL_DATE } from "@/lib/dailyLog";
import { localDateKey } from "@/lib/date";

const USER_ID = process.env.USER_ID || "default";

async function transcribeVoice(fileId: string, botToken: string): Promise<string | null> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return null;

  const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
  const fileData = await fileRes.json();
  const filePath = fileData?.result?.file_path;
  if (!filePath) return null;

  const audioRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
  const audioBlob = await audioRes.blob();

  const form = new FormData();
  form.append("file", audioBlob, "voice.ogg");
  form.append("model", "whisper-1");

  const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiKey}` },
    body: form,
  });
  if (!whisperRes.ok) return null;
  const whisperData = await whisperRes.json();
  return whisperData?.text ?? null;
}

async function logAudit(action: string, resourceType: string, metadata: Record<string, unknown>) {
  const supa = supabaseServer();
  await supa.from("audit_log").insert({ user_id: USER_ID, action, resource_type: resourceType, metadata });
}

export async function POST(req: Request) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const gotSecret = req.headers.get("x-telegram-bot-api-secret-token");
  if (!expectedSecret || gotSecret !== expectedSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const allowedUser = process.env.TELEGRAM_USER_ID;
  const update = await req.json().catch(() => null);
  const message = update?.message;
  if (!message || !botToken) return NextResponse.json({ ok: true });

  const fromId = String(message.from?.id ?? "");
  if (allowedUser && fromId !== allowedUser) {
    return NextResponse.json({ ok: true });
  }

  const chatId = message.chat.id;
  let text: string | null = message.text ?? null;

  if (!text && message.voice?.file_id) {
    text = await transcribeVoice(message.voice.file_id, botToken);
    if (!text) {
      await sendTelegramMessage(chatId, "Kon de voice note niet transcriberen — check of OPENAI_API_KEY is ingesteld.");
      return NextResponse.json({ ok: true });
    }
  }

  if (!text) return NextResponse.json({ ok: true });

  const supa = supabaseServer();
  const { data: capture } = await supa
    .from("raw_captures")
    .insert({ user_id: USER_ID, source: "telegram", raw_text: text })
    .select()
    .single();

  const { result, source } = await classifyCapture(text);

  if (capture) {
    await supa.from("raw_captures").update({ classification: result, llm_source: source }).eq("id", capture.id);
  }

  let reply = "";
  switch (result.action) {
    case "add_habit": {
      const habits = await addHabit(result.habit);
      reply = `Habit toegevoegd: "${result.habit}". Lijst: ${habits.join(", ")}`;
      break;
    }
    case "remove_habit": {
      const habits = await removeHabit(result.habit);
      reply = `Habit verwijderd: "${result.habit}". Lijst: ${habits.join(", ") || "(leeg)"}`;
      break;
    }
    case "add_task": {
      await supa.from("tasks").insert({
        user_id: USER_ID,
        title: result.title,
        urgency: result.urgency,
        key: result.key,
        priority_score: Date.now(),
      });
      reply = `Taak toegevoegd: "${result.title}" (${result.urgency}${result.key ? ", key" : ""})`;
      break;
    }
    case "add_goal": {
      const dateKey = GOALS_SENTINEL_DATE;
      const notesKey = result.scope === "week" ? "goals_week_items" : "goals_month_items";
      const current = (await supa.from("daily_logs").select("notes").eq("user_id", USER_ID).eq("log_date", dateKey).maybeSingle()).data;
      const parsed = current?.notes ? JSON.parse(current.notes) : {};
      const items = Array.isArray(parsed[notesKey]) ? parsed[notesKey] : [];
      items.push({ id: crypto.randomUUID(), text: result.text, done: false });
      await mergeDailyNotes(dateKey, { [notesKey]: items });
      reply = `Doel toegevoegd (${result.scope}): "${result.text}"`;
      break;
    }
    case "note":
    default: {
      reply = `Genoteerd: "${result.summary}"`;
      break;
    }
  }

  await logAudit("telegram_capture", result.action, { text, result, dateKey: localDateKey() });
  await sendTelegramMessage(chatId, reply);

  return NextResponse.json({ ok: true });
}
