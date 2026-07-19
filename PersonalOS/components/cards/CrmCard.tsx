"use client";

import { useEffect, useState } from "react";
import { Panel } from "../Panel";
import { SectionLabel } from "../SectionLabel";
import { Badge } from "../Badge";

type Task = { id: string; title: string; urgency: string; key: boolean; priority_score: number };

const TIERS = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "someday", label: "Someday" },
];

export function CrmCard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [urgency, setUrgency] = useState("today");

  async function load() {
    const res = await fetch("/api/tasks?status=open");
    if (!res.ok) return;
    const data = await res.json();
    setTasks(data.tasks ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const t = title.trim();
    setTitle("");
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, urgency }),
    });
    load();
  }

  async function complete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
  }

  return (
    <Panel>
      <SectionLabel num="06" text="CRM" />
      <form onSubmit={addTask} className="flex gap-2 mb-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task…"
          className="flex-1 rounded-md px-2 py-1 text-xs bg-transparent border outline-none"
          style={{ borderColor: "var(--line)", color: "var(--text-primary)" }}
        />
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="rounded-md px-2 py-1 text-xs bg-transparent border outline-none"
          style={{ borderColor: "var(--line)", color: "var(--text-secondary)" }}
        >
          {TIERS.map((t) => (
            <option key={t.value} value={t.value} style={{ background: "var(--bg-deep)" }}>
              {t.label}
            </option>
          ))}
        </select>
      </form>
      <div className="flex flex-col gap-3">
        {TIERS.map((tier) => {
          const rows = tasks.filter((t) => t.urgency === tier.value);
          if (rows.length === 0) return null;
          return (
            <div key={tier.value}>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                {tier.label}
              </div>
              <ul className="flex flex-col gap-1">
                {rows.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between text-sm rounded-md px-2 py-1"
                    style={{ border: "1px solid var(--line)" }}
                  >
                    <button
                      onClick={() => complete(t.id)}
                      className="text-left flex-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {t.title}
                    </button>
                    {t.key && <Badge tier={1}>Key</Badge>}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {tasks.length === 0 && (
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No open tasks.</p>
        )}
      </div>
    </Panel>
  );
}
