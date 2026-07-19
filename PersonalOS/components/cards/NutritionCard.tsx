"use client";

import { useEffect, useState } from "react";
import { CardHeader, DashPanel, DashInput } from "../dashboard/DashCard";

type Meal = { id: string; t: string; n: string; kcal: number; p: number; c: number; f: number };

const TARGET_KCAL = 2800;
const TARGET_P = 180;
const TARGET_C = 300;
const TARGET_F = 80;

// "300 kcal" or "2 eieren 150" -> best-effort kcal without needing an AI key.
function parseMeal(text: string): { n: string; kcal: number } {
  const match = text.match(/(\d+)\s*(kcal|cal)?/i);
  const kcal = match ? Number(match[1]) : 0;
  const n = text.replace(/\d+\s*(kcal|cal)?/i, "").trim() || text;
  return { n, kcal };
}

export function NutritionCard() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [text, setText] = useState("");

  async function load() {
    const res = await fetch("/api/nutrition");
    if (!res.ok) return;
    const data = await res.json();
    setMeals(data.meals ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function logMeal(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const { n, kcal } = parseMeal(text.trim());
    setText("");
    await fetch("/api/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ n, kcal, p: 0, c: 0, f: 0, estimated: false }),
    });
    load();
  }

  const totals = meals.reduce(
    (acc, m) => ({ kcal: acc.kcal + m.kcal, p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  );

  return (
    <DashPanel>
      <CardHeader
        num="08"
        title="NUTRITION"
        right={<span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Today</span>}
      />
      <div className="text-2xl mb-1" style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
        {totals.kcal}
      </div>
      <div className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
        of {TARGET_KCAL} kcal · {totals.kcal - TARGET_KCAL >= 0 ? "+" : ""}
        {totals.kcal - TARGET_KCAL} deficit
      </div>
      <div className="flex justify-between text-xs mb-3">
        <span>PROTEIN {totals.p}/{TARGET_P}g</span>
        <span>CARBS {totals.c}/{TARGET_C}g</span>
        <span>FAT {totals.f}/{TARGET_F}g</span>
      </div>
      <form onSubmit={logMeal} className="mb-3">
        <DashInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Log a meal — try "300 kcal broodje"'
        />
      </form>
      <div className="flex flex-col gap-1 text-xs">
        {meals.map((m) => (
          <div key={m.id} className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
            <span>{m.t} — {m.n}</span>
            <span>{m.kcal}k</span>
          </div>
        ))}
      </div>
    </DashPanel>
  );
}
