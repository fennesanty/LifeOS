import Link from "next/link";

const TABS = ["Home", "CRM", "Finance", "Review"] as const;
const TAB_HREF: Record<(typeof TABS)[number], string> = {
  Home: "/",
  CRM: "/crm",
  Finance: "/",
  Review: "/crm",
};

export function TopRail({ active = "Home" }: { active?: (typeof TABS)[number] }) {
  return (
    <header
      className="flex items-center justify-between px-4 py-2 text-[10px]"
      style={{ borderBottom: "1px solid var(--line)", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
    >
      <div className="flex items-center gap-2">
        <span style={{ color: "var(--good)" }}>●</span>
        <span style={{ color: "var(--text-primary)" }}>{"FENNE OS // V1"}</span>
        {TABS.map((tab) => (
          <Link
            key={tab}
            href={TAB_HREF[tab]}
            className="ml-1 rounded px-2 py-0.5"
            style={
              tab === active
                ? { border: "1px solid var(--good)", color: "var(--good)" }
                : { border: "1px solid var(--line)" }
            }
          >
            {tab.toUpperCase()}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span>BTC $64,120</span>
        <span>NDX 18,240</span>
        <span>XAU $2,384</span>
        <span>{new Date().toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</span>
        <span className="rounded px-1.5 py-0.5" style={{ border: "1px solid var(--line)" }}>FS</span>
      </div>
    </header>
  );
}
