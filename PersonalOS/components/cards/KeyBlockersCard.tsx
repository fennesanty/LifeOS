"use client";

import { useEffect, useState } from "react";
import { CardHeader, DashPanel, DashInput, Tag } from "../dashboard/DashCard";

type Task = { id: string; title: string; urgency: string; tags: string[] };

function toneFor(urgency: string): "hot" | "warm" | "cool" {
  if (urgency === "today") return "hot";
  if (urgency === "this_week") return "warm";
  return "cool";
}

export function KeyBlockersCard() {
  const [blockers, setBlockers] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  async function load() {
    const res = await fetch("/api/tasks?status=open");
    if (!res.ok) return;
    const data = await res.json();
    setBlockers((data.tasks as Task[]).filter((t) => t.tags?.includes("blocker")));
  }

  useEffect(() => {
    load();
  }, []);

  async function addBlocker(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const t = title.trim();
    setTitle("");
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, urgency: "this_week", tags: ["blocker"] }),
    });
    load();
  }

  async function resolve(id: string) {
    setBlockers((prev) => prev.filter((b) => b.id !== id));
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
  }

  return (
    <DashPanel>
      <CardHeader
        num="06"
        title="KEY BLOCKERS"
        right={<span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{blockers.length} active</span>}
      />
      <form onSubmit={addBlocker} className="mb-2">
        <DashInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a blocker…" />
      </form>
      <div className="flex flex-col gap-2 text-xs">
        {blockers.length === 0 ? (
          <span style={{ color: "var(--text-tertiary)" }}>No blockers.</span>
        ) : (
          blockers.map((b) => (
            <div key={b.id} className="flex items-center justify-between">
              <button onClick={() => resolve(b.id)} className="text-left" style={{ color: "var(--text-secondary)" }}>
                {b.title}
              </button>
              <Tag tone={toneFor(b.urgency)}>{toneFor(b.urgency)}</Tag>
            </div>
          ))
        )}
      </div>
    </DashPanel>
  );
}
