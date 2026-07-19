import { Panel } from "../Panel";
import { SectionLabel } from "../SectionLabel";

export function OperatorCard() {
  return (
    <Panel>
      <SectionLabel num="01" text="Operator" />
      <div style={{ color: "var(--text-primary)" }} className="text-lg font-medium">
        Fenne Santy
      </div>
      <div className="text-sm" style={{ color: "var(--text-tertiary)" }}>
        Kortrijk
      </div>
    </Panel>
  );
}
