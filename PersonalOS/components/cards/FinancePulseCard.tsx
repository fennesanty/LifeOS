"use client";

import { useEffect, useState } from "react";
import { CardHeader, DashPanel, Tag } from "../dashboard/DashCard";

type Finance = { net_worth: number; daily: number; monthly: number; currency: string; as_of: string | null };

export function FinancePulseCard() {
  const [finance, setFinance] = useState<Finance | null>(null);
  const [editing, setEditing] = useState(false);
  const [netWorth, setNetWorth] = useState("");

  useEffect(() => {
    fetch("/api/finance")
      .then((r) => r.json())
      .then((d) => setFinance(d.finance));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(netWorth);
    if (Number.isNaN(value)) return;
    const prev = finance?.net_worth ?? 0;
    const res = await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ net_worth: value, daily: value - prev, monthly: finance?.monthly ?? 0 }),
    });
    const data = await res.json();
    setFinance(data.finance);
    setEditing(false);
  }

  return (
    <DashPanel>
      <CardHeader num="07" title="FINANCE PULSE" right={<Tag tone="cool">Manual</Tag>} />
      <div className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>NET WORTH</div>
      {editing ? (
        <form onSubmit={save} className="flex gap-2 mb-2">
          <input
            autoFocus
            value={netWorth}
            onChange={(e) => setNetWorth(e.target.value)}
            placeholder={String(finance?.net_worth ?? 0)}
            className="rounded-md px-2 py-1 text-sm bg-transparent outline-none w-32"
            style={{ border: "1px solid var(--line)", color: "var(--text-primary)" }}
          />
          <button type="submit" className="text-xs rounded px-2" style={{ border: "1px solid var(--good)", color: "var(--good)" }}>
            Save
          </button>
        </form>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-2xl mb-2 block"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}
        >
          {finance ? `${finance.currency} ${finance.net_worth.toLocaleString()}` : "…"}
        </button>
      )}
      <div className="flex gap-4 text-xs">
        <div>
          <div style={{ color: "var(--text-tertiary)" }}>DAILY</div>
          <div style={{ color: (finance?.daily ?? 0) >= 0 ? "var(--good)" : "var(--bad)" }}>
            {finance ? `${finance.daily >= 0 ? "+" : ""}${finance.daily.toLocaleString()}` : "…"}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--text-tertiary)" }}>MONTHLY</div>
          <div style={{ color: (finance?.monthly ?? 0) >= 0 ? "var(--good)" : "var(--bad)" }}>
            {finance ? `${finance.monthly >= 0 ? "+" : ""}${finance.monthly.toLocaleString()}` : "…"}
          </div>
        </div>
      </div>
    </DashPanel>
  );
}
