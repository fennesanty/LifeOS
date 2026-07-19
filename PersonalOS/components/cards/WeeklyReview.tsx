"use client";

import { useEffect, useState } from "react";
import { DashPanel } from "../dashboard/DashCard";

type Review = {
  wins: string;
  slipped: string;
  open_loops: string;
  follow_up: string;
  content_shipped: string;
  health_pattern: string;
  next_week: string;
  sealed: boolean;
};

const EMPTY: Review = {
  wins: "",
  slipped: "",
  open_loops: "",
  follow_up: "",
  content_shipped: "",
  health_pattern: "",
  next_week: "",
  sealed: false,
};

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>{label.toUpperCase()}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-md px-3 py-2 text-xs bg-transparent outline-none resize-none"
        style={{ border: "1px solid var(--line)", color: "var(--text-primary)" }}
      />
    </div>
  );
}

export function WeeklyReview() {
  const [review, setReview] = useState<Review>(EMPTY);
  const [weekKey, setWeekKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/review");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(`Load failed: ${body.error ?? res.status}`);
      return;
    }
    const data = await res.json();
    setReview(data.review);
    setWeekKey(data.weekKey);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(sealed = review.sealed) {
    setSaving(true);
    setError(null);
    const body = { ...review, sealed };
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      const respBody = await res.json().catch(() => ({}));
      setError(`Save failed: ${respBody.error ?? res.status}`);
      return;
    }
    const data = await res.json();
    setReview(data.review);
  }

  return (
    <DashPanel className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>WEEKLY REVIEW</div>
          <div className="title-serif text-lg" style={{ color: "var(--text-primary)" }}>{weekKey || "…"}</div>
        </div>
        <button
          onClick={() => save(true)}
          disabled={saving}
          className="text-xs rounded px-3 py-1.5 font-bold"
          style={{ border: "1px solid var(--good)", color: "var(--good)" }}
        >
          {review.sealed ? "✓ Sealed" : "Seal week"}
        </button>
      </div>
      {error && (
        <div className="text-xs rounded-md px-3 py-2" style={{ border: "1px solid var(--bad)", color: "var(--bad)" }}>
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Field label="Wins this week" value={review.wins} onChange={(v) => setReview((r) => ({ ...r, wins: v }))} />
        <Field label="What slipped" value={review.slipped} onChange={(v) => setReview((r) => ({ ...r, slipped: v }))} />
        <Field label="Open loops" value={review.open_loops} onChange={(v) => setReview((r) => ({ ...r, open_loops: v }))} />
        <Field label="People to follow up with" value={review.follow_up} onChange={(v) => setReview((r) => ({ ...r, follow_up: v }))} />
        <Field label="Content shipped" value={review.content_shipped} onChange={(v) => setReview((r) => ({ ...r, content_shipped: v }))} />
        <Field label="Health pattern" value={review.health_pattern} onChange={(v) => setReview((r) => ({ ...r, health_pattern: v }))} />
      </div>
      <Field label="Next week — top 3" value={review.next_week} onChange={(v) => setReview((r) => ({ ...r, next_week: v }))} />
      <button
        onClick={() => save()}
        disabled={saving}
        className="self-start text-xs rounded px-3 py-1.5"
        style={{ border: "1px solid var(--line)", color: "var(--text-secondary)" }}
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </DashPanel>
  );
}
