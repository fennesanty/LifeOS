import { supabaseServer } from "./supabase/server";

const USER_ID = process.env.USER_ID || "default";

export type DailyNotes = {
  habits?: { done: string[]; total: number };
  goals_week_items?: GoalItem[];
  goals_month_items?: GoalItem[];
  nutrition?: { meals: Meal[] };
  [key: string]: unknown;
};

export type GoalItem = { id: string; text: string; done: boolean };
export type Meal = { id: string; t: string; n: string; kcal: number; p: number; c: number; f: number; estimated: boolean };

// Goals never auto-clear — stored on a sentinel date instead of "today".
export const GOALS_SENTINEL_DATE = "2000-01-01";

export async function getDailyNotes(dateKey: string): Promise<DailyNotes> {
  const supa = supabaseServer();
  const { data } = await supa
    .from("daily_logs")
    .select("notes")
    .eq("user_id", USER_ID)
    .eq("log_date", dateKey)
    .maybeSingle();
  if (!data?.notes) return {};
  try {
    return JSON.parse(data.notes) as DailyNotes;
  } catch {
    return {};
  }
}

export async function mergeDailyNotes(dateKey: string, patch: Partial<DailyNotes>): Promise<DailyNotes> {
  const supa = supabaseServer();
  const current = await getDailyNotes(dateKey);
  const merged = { ...current, ...patch };
  const { error } = await supa
    .from("daily_logs")
    .upsert(
      { user_id: USER_ID, log_date: dateKey, notes: JSON.stringify(merged) },
      { onConflict: "user_id,log_date" }
    );
  if (error) throw new Error(error.message);
  return merged;
}
