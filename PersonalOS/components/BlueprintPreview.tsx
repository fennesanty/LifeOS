import { Panel } from "./Panel";
import { SectionLabel } from "./SectionLabel";

function Tag({ tone, children }: { tone: "hot" | "warm" | "cool"; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    hot: "var(--bad)",
    warm: "var(--warn)",
    cool: "var(--text-tertiary)",
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

function CardHeader({ num, title, right }: { num: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-bold tracking-wider" style={{ color: "var(--text-tertiary)" }}>
        {`${num} // ${title}`}
      </span>
      {right}
    </div>
  );
}

function MiniPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-3" style={{ border: "1px solid var(--line)" }}>
      {children}
    </div>
  );
}

export function BlueprintPreview() {
  return (
    <Panel className="col-span-1 lg:col-span-3">
      <SectionLabel num="00" text="Blueprint — Miles Deutscher's Personal OS mockup" />
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--line-soft)", background: "#050505" }}>
        {/* top rail */}
        <div
          className="flex items-center justify-between px-4 py-2 text-[10px]"
          style={{ borderBottom: "1px solid var(--line)", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: "var(--good)" }}>●</span>
            <span style={{ color: "var(--text-primary)" }}>{"MILES OS // V3.1"}</span>
            <span className="ml-3 rounded px-2 py-0.5" style={{ border: "1px solid var(--line)" }}>HOME</span>
            <span>CRM</span>
            <span>FINANCE</span>
            <span>REVIEW</span>
          </div>
          <div className="flex items-center gap-3">
            <span>BTC $64,120</span>
            <span>NDX 18,240</span>
            <span>XAU $2,384</span>
            <span>MAY 08, 2026 15:38</span>
            <span className="rounded px-1.5 py-0.5" style={{ border: "1px solid var(--line)" }}>MD</span>
          </div>
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-3 p-3">
          {/* left column */}
          <div className="flex flex-col gap-3">
            <MiniPanel>
              <CardHeader num="01" title="OPERATOR" right={<Tag tone="cool">Online</Tag>} />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-md" style={{ background: "var(--bg-glow)" }} />
                <div>
                  <div style={{ color: "var(--text-primary)" }}>[First] [Last]</div>
                  <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>[Role] · [City]</div>
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <div>
                  <div style={{ color: "var(--text-tertiary)" }}>FOCUS</div>
                  <div style={{ color: "var(--text-secondary)" }}>[Your focus today]</div>
                </div>
                <div>
                  <div style={{ color: "var(--text-tertiary)" }}>STREAK</div>
                  <div style={{ color: "var(--good)" }}>0 days</div>
                </div>
              </div>
            </MiniPanel>
            <MiniPanel>
              <CardHeader num="07" title="FINANCE PULSE" right={<Tag tone="cool">Live</Tag>} />
              <div className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>NET WORTH</div>
              <div className="text-2xl mb-2" style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                $[Net worth]
              </div>
              <div className="flex gap-4 text-xs">
                <div>
                  <div style={{ color: "var(--text-tertiary)" }}>DAILY</div>
                  <div style={{ color: "var(--good)" }}>+$[Day]</div>
                </div>
                <div>
                  <div style={{ color: "var(--text-tertiary)" }}>MONTHLY</div>
                  <div style={{ color: "var(--good)" }}>+$[Month]</div>
                </div>
              </div>
            </MiniPanel>
            <MiniPanel>
              <CardHeader num="06" title="KEY BLOCKERS" right={<span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>7 active</span>} />
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>[Blocker 1 — what&apos;s stuck]</span>
                  <Tag tone="hot">Hot</Tag>
                </div>
                <div className="flex items-center justify-between">
                  <span>[Blocker 2 — what&apos;s stuck]</span>
                  <Tag tone="warm">Warm</Tag>
                </div>
                <div className="flex items-center justify-between">
                  <span>[Blocker 3 — what&apos;s stuck]</span>
                  <Tag tone="warm">Warm</Tag>
                </div>
              </div>
            </MiniPanel>
          </div>

          {/* center column */}
          <div className="flex flex-col gap-3">
            <MiniPanel>
              <CardHeader num="02" title="SESSION" right={<span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>UTC±0</span>} />
              <div className="title-serif text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                Good afternoon, <em>[name]</em>.
              </div>
              <div className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>FRIDAY, MAY 8</div>
              <div
                className="rounded-md px-3 py-2 text-xs mb-2"
                style={{ border: "1px solid var(--line)", color: "var(--text-tertiary)" }}
              >
                TODAY I WILL &nbsp; Set today&apos;s one thing...
              </div>
              <div
                className="rounded-md px-3 py-2 text-xs flex items-center justify-between"
                style={{ border: "1px solid var(--line)", color: "var(--text-tertiary)" }}
              >
                <span>⌘ Capture</span>
                <span className="rounded px-2 py-0.5" style={{ border: "1px solid var(--good)", color: "var(--good)" }}>Capture</span>
              </div>
            </MiniPanel>
            <MiniPanel>
              <CardHeader num="03" title="HABITS" right={<span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>0/6 · 0%</span>} />
              <div className="grid grid-cols-3 gap-2 text-xs">
                {["Habit 1", "Habit 2", "Habit 3", "Habit 4", "Habit 5", "Habit 6"].map((h) => (
                  <div key={h} className="rounded-md px-2 py-2" style={{ border: "1px solid var(--line)", color: "var(--text-secondary)" }}>
                    [{h}]
                  </div>
                ))}
              </div>
            </MiniPanel>
            <MiniPanel>
              <CardHeader num="04" title="CALENDAR" right={<span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>MAY 2026</span>} />
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-2">
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d, i) => (
                  <div
                    key={d}
                    className="rounded py-1"
                    style={i === 4 ? { background: "var(--bg-glow)", color: "var(--text-primary)" } : { color: "var(--text-tertiary)" }}
                  >
                    {d}<br />0{4 + i}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <div style={{ color: "var(--text-secondary)" }}>[Block 1 — primary work]</div>
                <div style={{ color: "var(--text-secondary)" }}>[Block 2 — recurring sync]</div>
              </div>
            </MiniPanel>
          </div>

          {/* right column */}
          <div className="flex flex-col gap-3">
            <MiniPanel>
              <CardHeader num="08" title="NUTRITION" right={<span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Today</span>} />
              <div className="text-2xl mb-1" style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>0</div>
              <div className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>of 2800 kcal · −2500 deficit</div>
              <div className="flex justify-between text-xs mb-3">
                <span>PROTEIN 0/180g</span>
                <span>CARBS 0/300g</span>
                <span>FAT 0/80g</span>
              </div>
              <div
                className="rounded-md px-3 py-2 text-xs"
                style={{ border: "1px solid var(--line)", color: "var(--text-tertiary)" }}
              >
                Log a meal — try &quot;estimate 500 cals&quot;
              </div>
            </MiniPanel>
          </div>
        </div>
      </div>
    </Panel>
  );
}
