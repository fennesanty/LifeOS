"use client";

import { useEffect, useState } from "react";
import { CardHeader, DashPanel } from "../dashboard/DashCard";
import { localDateKey } from "@/lib/date";

export function HabitTracker() {
  const [habits, setHabits] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const dateKey = localDateKey();

  useEffect(() => {
    const cacheKey = `pos-habits-${dateKey}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) setDone(JSON.parse(cached));

    fetch("/api/habits/config")
      .then((r) => r.json())
      .then((d) => setHabits(d.habits ?? []));

    fetch(`/api/habits?days=1`)
      .then((r) => r.json())
      .then((data) => {
        const today = data.habits?.[dateKey];
        if (today?.done) setDone(today.done);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [dateKey]);

  async function toggle(habit: string) {
    const next = done.includes(habit) ? done.filter((h) => h !== habit) : [...done, habit];
    setDone(next);
    localStorage.setItem(`pos-habits-${dateKey}`, JSON.stringify(next));
    await fetch(`/api/habits/${dateKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: next, total: habits.length }),
    });
  }

  return (
    <DashPanel>
      <CardHeader
        num="03"
        title="HABITS"
        right={<span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{done.length}/{habits.length} · {Math.round((done.length / Math.max(habits.length, 1)) * 100)}%</span>}
      />
      <div className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
        {loaded ? "synced" : "loading…"}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {habits.map((h) => {
          const active = done.includes(h);
          return (
            <button
              key={h}
              onClick={() => toggle(h)}
              className="rounded-md px-3 py-2 text-xs text-left"
              style={
                active
                  ? { background: "var(--good)", color: "var(--bg-deep)", fontWeight: 700 }
                  : { border: "1px solid var(--line)", color: "var(--text-secondary)" }
              }
            >
              {h}
            </button>
          );
        })}
      </div>
    </DashPanel>
  );
}
