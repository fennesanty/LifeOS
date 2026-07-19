"use client";

import { useEffect, useState } from "react";
import { CardHeader, DashPanel, DashInput } from "../dashboard/DashCard";
import { localDateKey } from "@/lib/date";

type Task = { id: string; title: string; due_date: string | null };

function weekDays(): Date[] {
  const today = new Date();
  const monday = new Date(today);
  const dow = (today.getDay() + 6) % 7; // 0 = Monday
  monday.setDate(today.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function CalendarCard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const days = weekDays();
  const todayKey = localDateKey();
  const [selected, setSelected] = useState(todayKey);

  async function load() {
    const res = await fetch("/api/tasks?status=open");
    if (!res.ok) return;
    const data = await res.json();
    setTasks((data.tasks as Task[]).filter((t) => t.due_date));
  }

  useEffect(() => {
    load();
  }, []);

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const t = title.trim();
    setTitle("");
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, urgency: "this_week", due_date: selected }),
    });
    load();
  }

  const dayEvents = tasks.filter((t) => t.due_date === selected);

  return (
    <DashPanel>
      <CardHeader
        num="04"
        title="CALENDAR"
        right={
          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            {new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </span>
        }
      />
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-3">
        {days.map((d, i) => {
          const key = localDateKey(d);
          const active = key === selected;
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className="rounded py-1"
              style={active ? { background: "var(--bg-glow)", color: "var(--text-primary)" } : { color: "var(--text-tertiary)" }}
            >
              {DAY_LABELS[i]}
              <br />
              {String(d.getDate()).padStart(2, "0")}
            </button>
          );
        })}
      </div>
      <form onSubmit={addEvent} className="mb-2">
        <DashInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add event on selected day…"
        />
      </form>
      <div className="flex flex-col gap-1 text-xs">
        {dayEvents.length === 0 ? (
          <span style={{ color: "var(--text-tertiary)" }}>No events.</span>
        ) : (
          dayEvents.map((t) => (
            <div key={t.id} style={{ color: "var(--text-secondary)" }}>
              {t.title}
            </div>
          ))
        )}
      </div>
    </DashPanel>
  );
}
