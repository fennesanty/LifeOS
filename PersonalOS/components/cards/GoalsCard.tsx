"use client";

import { useEffect, useState } from "react";
import { Panel } from "../Panel";
import { SectionLabel } from "../SectionLabel";

type GoalItem = { id: string; text: string; done: boolean };

function Section({
  title,
  items,
  onToggle,
  onAdd,
}: {
  title: string;
  items: GoalItem[];
  onToggle: (id: string) => void;
  onAdd: (text: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <div className="mb-4 last:mb-0">
      <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
        {title}
      </div>
      <ul className="flex flex-col gap-1 mb-2">
        {items.map((g) => (
          <li key={g.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={g.done} onChange={() => onToggle(g.id)} />
            <span
              style={{
                color: g.done ? "var(--text-tertiary)" : "var(--text-secondary)",
                textDecoration: g.done ? "line-through" : "none",
              }}
            >
              {g.text}
            </span>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onAdd(text.trim());
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a goal…"
          className="w-full rounded-md px-2 py-1 text-xs bg-transparent border outline-none"
          style={{ borderColor: "var(--line)", color: "var(--text-primary)" }}
        />
      </form>
    </div>
  );
}

export function GoalsCard() {
  const [week, setWeek] = useState<GoalItem[]>([]);
  const [month, setMonth] = useState<GoalItem[]>([]);

  useEffect(() => {
    fetch("/api/goals")
      .then((r) => r.json())
      .then((d) => {
        setWeek(d.week ?? []);
        setMonth(d.month ?? []);
      });
  }, []);

  async function save(scope: "week" | "month", items: GoalItem[]) {
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope, items }),
    });
  }

  function toggleWeek(id: string) {
    const next = week.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
    setWeek(next);
    save("week", next);
  }
  function addWeek(text: string) {
    const next = [...week, { id: crypto.randomUUID(), text, done: false }];
    setWeek(next);
    save("week", next);
  }
  function toggleMonth(id: string) {
    const next = month.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
    setMonth(next);
    save("month", next);
  }
  function addMonth(text: string) {
    const next = [...month, { id: crypto.randomUUID(), text, done: false }];
    setMonth(next);
    save("month", next);
  }

  return (
    <Panel>
      <SectionLabel num="05" text="Goals" />
      <Section title="This week" items={week} onToggle={toggleWeek} onAdd={addWeek} />
      <Section title="This month" items={month} onToggle={toggleMonth} onAdd={addMonth} />
    </Panel>
  );
}
