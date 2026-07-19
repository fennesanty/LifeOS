"use client";

import { useEffect, useState } from "react";
import { Panel } from "../Panel";
import { SectionLabel } from "../SectionLabel";
import { localDateKey } from "@/lib/date";

const DEFAULT_HABITS = ["Water", "Movement", "Reading", "Deep work", "No sugar", "Sleep 8h"];

export function HabitTracker() {
  const [done, setDone] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const dateKey = localDateKey();

  useEffect(() => {
    const cacheKey = `pos-habits-${dateKey}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) setDone(JSON.parse(cached));

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
      body: JSON.stringify({ done: next, total: DEFAULT_HABITS.length }),
    });
  }

  return (
    <Panel>
      <SectionLabel num="03" text="Habits" />
      <div className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
        {done.length}/{DEFAULT_HABITS.length} · {loaded ? "synced" : "loading…"}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {DEFAULT_HABITS.map((h) => {
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
    </Panel>
  );
}
