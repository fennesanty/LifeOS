const TABS = ["Home", "CRM", "Brain", "Finance", "Journal", "Health"] as const;

export function TopRail({ active = "Home" }: { active?: (typeof TABS)[number] }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--line)" }}>
      <div className="title-serif text-xl">Personal OS</div>
      <nav className="flex gap-2">
        {TABS.map((tab) => (
          <span
            key={tab}
            className="pill"
            style={
              tab === active
                ? { background: "var(--good)", borderColor: "var(--good)", color: "var(--bg-deep)", fontWeight: 700 }
                : undefined
            }
          >
            {tab}
          </span>
        ))}
      </nav>
      <div className="text-sm" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
        {new Date().toLocaleDateString()}
      </div>
    </header>
  );
}
