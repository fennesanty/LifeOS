"use client";

import { useEffect, useState } from "react";
import { CardHeader, DashPanel } from "../dashboard/DashCard";

type Task = {
  id: string;
  title: string;
  urgency: string;
  key: boolean;
  priority_score: number;
  time_estimate_min: number | null;
};

export function SessionCard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusText, setFocusText] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/tasks?status=open");
    if (!res.ok) return;
    const data = await res.json();
    const top = (data.tasks as Task[])
      .filter((t) => t.urgency === "today" && t.key)
      .sort((a, b) => b.priority_score - a.priority_score)
      .slice(0, 3);
    setTasks(top);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function capture(e: React.FormEvent) {
    e.preventDefault();
    if (!focusText.trim()) return;
    const title = focusText.trim();
    setFocusText("");
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, urgency: "today", key: true }),
    });
    load();
  }

  return (
    <DashPanel>
      <CardHeader
        num="02"
        title="SESSION"
        right={<span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>UTC±0</span>}
      />
      <div className="title-serif text-lg mb-1" style={{ color: "var(--text-primary)" }}>
        Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, <em>Fenne</em>.
      </div>
      <div className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
        {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}
      </div>
      <form onSubmit={capture} className="flex gap-2">
        <input
          value={focusText}
          onChange={(e) => setFocusText(e.target.value)}
          placeholder="Set today's one thing…"
          className="flex-1 rounded-md px-3 py-2 text-xs bg-transparent outline-none"
          style={{ border: "1px solid var(--line)", color: "var(--text-primary)" }}
        />
        <button
          type="submit"
          className="rounded-md px-3 py-2 text-xs font-bold"
          style={{ border: "1px solid var(--good)", color: "var(--good)" }}
        >
          Capture
        </button>
      </form>
      {!loading && tasks.length > 0 && (
        <ul className="flex flex-col gap-2 mt-3">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between text-xs rounded-md px-3 py-2"
              style={{ border: "1px solid var(--line)", color: "var(--text-secondary)" }}
            >
              <span>{t.title}</span>
              {t.time_estimate_min && (
                <span style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                  {t.time_estimate_min}m
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </DashPanel>
  );
}
