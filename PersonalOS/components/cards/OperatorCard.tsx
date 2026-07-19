import { CardHeader, DashPanel, Tag } from "../dashboard/DashCard";

export function OperatorCard() {
  return (
    <DashPanel>
      <CardHeader num="01" title="OPERATOR" right={<Tag tone="good">Online</Tag>} />
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-md" style={{ background: "var(--bg-glow)" }} />
        <div>
          <div style={{ color: "var(--text-primary)" }}>Fenne Santy</div>
          <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>Kortrijk</div>
        </div>
      </div>
      <div className="flex justify-between text-xs">
        <div>
          <div style={{ color: "var(--text-tertiary)" }}>FOCUS</div>
          <div style={{ color: "var(--text-secondary)" }}>Ship the dashboard</div>
        </div>
        <div>
          <div style={{ color: "var(--text-tertiary)" }}>STREAK</div>
          <div style={{ color: "var(--good)" }}>0 days</div>
        </div>
      </div>
    </DashPanel>
  );
}
