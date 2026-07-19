export function Tag({ tone, children }: { tone: "hot" | "warm" | "cool" | "good"; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    hot: "var(--bad)",
    warm: "var(--warn)",
    cool: "var(--text-tertiary)",
    good: "var(--good)",
  };
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
      style={{ border: `1px solid ${colors[tone]}`, color: colors[tone] }}
    >
      {children}
    </span>
  );
}

export function CardHeader({ num, title, right }: { num: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-bold tracking-wider" style={{ color: "var(--text-tertiary)" }}>
        {`${num} // ${title}`}
      </span>
      {right}
    </div>
  );
}

export function DashPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg p-3 ${className}`}
      style={{ border: "1px solid var(--line)", background: "#050505" }}
    >
      {children}
    </div>
  );
}

export function DashInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`rounded-md px-3 py-2 text-xs bg-transparent outline-none w-full ${props.className ?? ""}`}
      style={{ border: "1px solid var(--line)", color: "var(--text-primary)", ...props.style }}
    />
  );
}
