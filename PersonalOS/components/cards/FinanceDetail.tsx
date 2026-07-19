"use client";

import { useEffect, useState } from "react";
import { DashPanel, DashInput } from "../dashboard/DashCard";

type Finance = {
  net_worth: number;
  liquid_cash: number;
  invested_assets: number;
  liabilities: number;
  income_mo: number;
  burn_mo: number;
  currency: string;
  history: { period: string; net_worth: number; liquid: number; invested: number; liabilities: number }[];
};

const EMPTY: Finance = {
  net_worth: 0,
  liquid_cash: 0,
  invested_assets: 0,
  liabilities: 0,
  income_mo: 0,
  burn_mo: 0,
  currency: "EUR",
  history: [],
};

function fmt(n: number, currency: string) {
  return `${currency} ${n.toLocaleString()}`;
}

export function FinanceDetail() {
  const [finance, setFinance] = useState<Finance>(EMPTY);
  const [form, setForm] = useState({ net_worth: "", liquid_cash: "", invested_assets: "", liabilities: "", income_mo: "", burn_mo: "" });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/finance");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(`Load failed: ${body.error ?? res.status}`);
      return;
    }
    const data = await res.json();
    setFinance(data.finance);
    setForm({
      net_worth: String(data.finance.net_worth),
      liquid_cash: String(data.finance.liquid_cash),
      invested_assets: String(data.finance.invested_assets),
      liabilities: String(data.finance.liabilities),
      income_mo: String(data.finance.income_mo),
      burn_mo: String(data.finance.burn_mo),
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(`Save failed: ${body.error ?? res.status}`);
      return;
    }
    load();
  }

  const runway = finance.burn_mo > 0 ? Math.round(finance.liquid_cash / finance.burn_mo) : "∞";

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="text-xs rounded-md px-3 py-2" style={{ border: "1px solid var(--bad)", color: "var(--bad)" }}>
          {error}
        </div>
      )}
      <form onSubmit={save} className="grid grid-cols-2 lg:grid-cols-6 gap-2">
        {(
          [
            ["net_worth", "Net worth"],
            ["liquid_cash", "Liquid cash"],
            ["invested_assets", "Invested"],
            ["liabilities", "Liabilities"],
            ["income_mo", "Income/mo"],
            ["burn_mo", "Burn/mo"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            {label.toUpperCase()}
            <DashInput
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="mt-1"
            />
          </label>
        ))}
        <button
          type="submit"
          className="col-span-2 lg:col-span-6 rounded-md px-3 py-2 text-xs font-bold"
          style={{ border: "1px solid var(--good)", color: "var(--good)" }}
        >
          Save snapshot
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <DashPanel>
          <div className="text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>NET WORTH · LIVE</div>
          <div className="text-2xl" style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            {fmt(finance.net_worth, finance.currency)}
          </div>
        </DashPanel>
        <DashPanel>
          <div className="text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>RUNWAY</div>
          <div className="text-2xl" style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            {runway} mo
          </div>
        </DashPanel>
        <DashPanel>
          <div className="text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>INCOME / MO</div>
          <div className="text-2xl" style={{ fontFamily: "var(--font-mono)", color: "var(--good)" }}>
            {fmt(finance.income_mo, finance.currency)}
          </div>
        </DashPanel>
        <DashPanel>
          <div className="text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>BURN / MO</div>
          <div className="text-2xl" style={{ fontFamily: "var(--font-mono)", color: "var(--bad)" }}>
            {fmt(finance.burn_mo, finance.currency)}
          </div>
        </DashPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <DashPanel>
          <div className="text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>LIQUID CASH</div>
          <div className="text-xl" style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            {fmt(finance.liquid_cash, finance.currency)}
          </div>
        </DashPanel>
        <DashPanel>
          <div className="text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>INVESTED ASSETS</div>
          <div className="text-xl" style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            {fmt(finance.invested_assets, finance.currency)}
          </div>
        </DashPanel>
        <DashPanel>
          <div className="text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>LIABILITIES</div>
          <div className="text-xl" style={{ fontFamily: "var(--font-mono)", color: "var(--bad)" }}>
            {fmt(finance.liabilities, finance.currency)}
          </div>
        </DashPanel>
      </div>

      <DashPanel>
        <div className="text-[10px] mb-2" style={{ color: "var(--text-tertiary)" }}>SNAPSHOT HISTORY</div>
        {finance.history.length === 0 ? (
          <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>No snapshots saved yet.</div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "var(--text-tertiary)" }}>
                <th className="text-left font-normal">PERIOD</th>
                <th className="text-right font-normal">NET WORTH</th>
                <th className="text-right font-normal">LIQUID</th>
                <th className="text-right font-normal">INVESTED</th>
                <th className="text-right font-normal">LIABILITIES</th>
              </tr>
            </thead>
            <tbody>
              {finance.history.map((h) => (
                <tr key={h.period} style={{ color: "var(--text-secondary)" }}>
                  <td className="py-1">{h.period}</td>
                  <td className="text-right">{fmt(h.net_worth, finance.currency)}</td>
                  <td className="text-right">{fmt(h.liquid, finance.currency)}</td>
                  <td className="text-right">{fmt(h.invested, finance.currency)}</td>
                  <td className="text-right">{fmt(h.liabilities, finance.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DashPanel>
    </div>
  );
}
