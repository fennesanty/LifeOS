"use client";

import { useEffect, useState } from "react";
import { Panel } from "../Panel";
import { SectionLabel } from "../SectionLabel";

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
  const [newTitle, setNewTitle] = useState("");
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

  async function addTodayKeyTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const title = newTitle.trim();
    setNewTitle("");
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, urgency: "today", key: true }),
    });
    load();
  }

  return (
    <Panel>
      <SectionLabel num="02" text="Session" />
      <div className="title-serif text-xl mb-3" style={{ color: "var(--text-primary)" }}>
        Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, Fenne.
      </div>
      <form onSubmit={addTodayKeyTask} className="mb-3">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a key task for today…"
          className="w-full rounded-md px-3 py-2 text-sm bg-transparent border outline-none"
          style={{ borderColor: "var(--line)", color: "var(--text-primary)" }}
        />
      </form>
      {loading ? (
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No key tasks for today yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between text-sm rounded-md px-3 py-2"
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
    </Panel>
  );
}
