import { Panel } from "./Panel";
import { SectionLabel } from "./SectionLabel";

const TABS = ["Home", "CRM", "Brain", "Finance", "Journal", "Health"];

const LEFT = ["Operator", "Finance Pulse", "Key Blockers"];
const CENTER = ["Session", "Habit Tracker", "Priorities"];
const RIGHT = ["Nutrition"];

function MiniCard({ title }: { title: string }) {
  return (
    <div
      className="rounded-md px-3 py-2 text-xs"
      style={{ border: "1px solid var(--line)", color: "var(--text-secondary)" }}
    >
      {title}
    </div>
  );
}

export function BlueprintPreview() {
  return (
    <Panel className="col-span-1 lg:col-span-3">
      <SectionLabel num="00" text="Blueprint — Miles Deutscher's Personal OS mockup" />
      <p className="mb-4 text-sm" style={{ color: "var(--text-tertiary)" }}>
        Layout reference from the &ldquo;Personal OS Build Cheat Sheet&rdquo; (Part 2) — top rail,
        3-column grid, 7 cards. This is what we&apos;re building out card by card.
      </p>
      <div
        className="rounded-lg p-3"
        style={{ border: "1px solid var(--line-soft)", background: "color-mix(in oklch, var(--bg-glow) 35%, transparent)" }}
      >
        <div
          className="flex items-center justify-between mb-3 pb-2 text-[11px]"
          style={{ borderBottom: "1px solid var(--line)", color: "var(--text-tertiary)" }}
        >
          <span className="title-serif" style={{ fontSize: "13px" }}>
            Personal OS
          </span>
          <div className="flex gap-2">
            {TABS.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <span>date · avatar</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr] gap-2">
          <div className="flex flex-col gap-2">
            {LEFT.map((c) => (
              <MiniCard key={c} title={c} />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {CENTER.map((c) => (
              <MiniCard key={c} title={c} />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {RIGHT.map((c) => (
              <MiniCard key={c} title={c} />
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
