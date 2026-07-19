"use client";

import { useEffect, useState } from "react";
import { CardHeader, DashPanel, Tag } from "../dashboard/DashCard";

type Profile = { name: string; city: string; focus: string; avatar_url: string | null };

export function OperatorCard() {
  const [profile, setProfile] = useState<Profile>({ name: "Fenne Santy", city: "Kortrijk", focus: "Ship the dashboard", avatar_url: null });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.profile);
        setForm(d.profile);
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(`Save failed: ${body.error ?? res.status}`);
      return;
    }
    const data = await res.json();
    setProfile(data.profile);
    setEditing(false);
  }

  return (
    <DashPanel>
      <CardHeader num="01" title="OPERATOR" right={<Tag tone="good">Online</Tag>} />
      {editing ? (
        <form onSubmit={save} className="flex flex-col gap-2">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Name"
            className="rounded-md px-2 py-1 text-sm bg-transparent outline-none"
            style={{ border: "1px solid var(--line)", color: "var(--text-primary)" }}
          />
          <input
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            placeholder="City"
            className="rounded-md px-2 py-1 text-xs bg-transparent outline-none"
            style={{ border: "1px solid var(--line)", color: "var(--text-secondary)" }}
          />
          <input
            value={form.focus}
            onChange={(e) => setForm((f) => ({ ...f, focus: e.target.value }))}
            placeholder="Focus today"
            className="rounded-md px-2 py-1 text-xs bg-transparent outline-none"
            style={{ border: "1px solid var(--line)", color: "var(--text-secondary)" }}
          />
          {error && <div className="text-[10px]" style={{ color: "var(--bad)" }}>{error}</div>}
          <div className="flex gap-2">
            <button type="submit" className="text-xs rounded px-2 py-1" style={{ border: "1px solid var(--good)", color: "var(--good)" }}>
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(profile);
                setEditing(false);
              }}
              className="text-xs rounded px-2 py-1"
              style={{ border: "1px solid var(--line)", color: "var(--text-tertiary)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setEditing(true)} className="w-full text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-md" style={{ background: "var(--bg-glow)" }} />
            <div>
              <div style={{ color: "var(--text-primary)" }}>{profile.name}</div>
              <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{profile.city}</div>
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <div>
              <div style={{ color: "var(--text-tertiary)" }}>FOCUS</div>
              <div style={{ color: "var(--text-secondary)" }}>{profile.focus}</div>
            </div>
            <div>
              <div style={{ color: "var(--text-tertiary)" }}>STREAK</div>
              <div style={{ color: "var(--good)" }}>0 days</div>
            </div>
          </div>
        </button>
      )}
    </DashPanel>
  );
}
