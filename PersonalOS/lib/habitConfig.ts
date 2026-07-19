import { getDailyNotes, mergeDailyNotes } from "./dailyLog";

// Separate sentinel from the goals one — this row holds app config, not a real day.
export const HABIT_CONFIG_SENTINEL = "1900-01-01";

const DEFAULT_HABITS = ["Water", "Movement", "Reading", "Deep work", "No sugar", "Sleep 8h"];

export async function getHabitConfig(): Promise<string[]> {
  const notes = await getDailyNotes(HABIT_CONFIG_SENTINEL);
  const list = notes.habit_config as string[] | undefined;
  return Array.isArray(list) && list.length > 0 ? list : DEFAULT_HABITS;
}

export async function addHabit(name: string): Promise<string[]> {
  const current = await getHabitConfig();
  if (current.some((h) => h.toLowerCase() === name.toLowerCase())) return current;
  const next = [...current, name];
  await mergeDailyNotes(HABIT_CONFIG_SENTINEL, { habit_config: next });
  return next;
}

export async function removeHabit(name: string): Promise<string[]> {
  const current = await getHabitConfig();
  const next = current.filter((h) => h.toLowerCase() !== name.toLowerCase());
  await mergeDailyNotes(HABIT_CONFIG_SENTINEL, { habit_config: next });
  return next;
}
