export type ClassifiedCapture =
  | { action: "add_habit"; habit: string }
  | { action: "remove_habit"; habit: string }
  | { action: "add_task"; title: string; urgency: "today" | "this_week" | "this_month" | "someday"; key: boolean }
  | { action: "add_goal"; scope: "week" | "month"; text: string }
  | { action: "note"; summary: string };

const SYSTEM_PROMPT = `You are the classifier for a personal dashboard's capture pipeline. The user sends short voice/text notes. Decide what they want and return ONLY a JSON object, no prose, matching one of:
{"action":"add_habit","habit":"<name>"}
{"action":"remove_habit","habit":"<name>"}
{"action":"add_task","title":"<title>","urgency":"today|this_week|this_month|someday","key":true|false}
{"action":"add_goal","scope":"week|month","text":"<goal text>"}
{"action":"note","summary":"<short summary of the raw text, for the ones that are just general notes>"}

Examples:
"voeg een habit toe: 10000 stappen" -> {"action":"add_habit","habit":"10000 stappen"}
"verwijder de habit lezen" -> {"action":"remove_habit","habit":"lezen"}
"ik moet vandaag de belastingen indienen, heel belangrijk" -> {"action":"add_task","title":"belastingen indienen","urgency":"today","key":true}
"doel voor deze week: 3x sporten" -> {"action":"add_goal","scope":"week","text":"3x sporten"}
Default to "note" if nothing else fits. Reply in the same language as the input where relevant (keep habit/task/goal text in that language), but the JSON keys and action values stay in English exactly as shown.`;

async function classifyWithAnthropic(text: string): Promise<ClassifiedCapture | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: text }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.content?.[0]?.text;
    if (!raw) return null;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as ClassifiedCapture;
  } catch {
    return null;
  }
}

/** Regex last-resort so the pipeline still does something useful without an API key. */
function classifyWithRegex(text: string): ClassifiedCapture {
  const lower = text.toLowerCase();
  const addHabitMatch = lower.match(/^(voeg|add).*(habit).*?:?\s*(.+)$/);
  if (addHabitMatch?.[3]) return { action: "add_habit", habit: addHabitMatch[3].trim() };
  const removeHabitMatch = lower.match(/^(verwijder|remove).*(habit).*?:?\s*(.+)$/);
  if (removeHabitMatch?.[3]) return { action: "remove_habit", habit: removeHabitMatch[3].trim() };
  return { action: "note", summary: text.slice(0, 200) };
}

export async function classifyCapture(text: string): Promise<{ result: ClassifiedCapture; source: "anthropic" | "regex" }> {
  const fromAnthropic = await classifyWithAnthropic(text);
  if (fromAnthropic) return { result: fromAnthropic, source: "anthropic" };
  return { result: classifyWithRegex(text), source: "regex" };
}
