import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { Panel } from "@/components/Panel";
import { SectionLabel } from "@/components/SectionLabel";
import { BlueprintPreview } from "@/components/BlueprintPreview";
import { AUTH_COOKIE, verifySessionToken } from "@/lib/auth";

export default async function Home() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  const ok = await verifySessionToken(token).catch(() => false);
  if (!ok) {
    redirect("/login?from=%2F");
  }

  return (
    <Shell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-4">
        <BlueprintPreview />
        <div className="flex flex-col gap-4">
          <Panel>
            <SectionLabel num="01" text="Operator" />
            <p style={{ color: "var(--text-tertiary)" }}>Card coming in Phase 2.</p>
          </Panel>
          <Panel>
            <SectionLabel num="02" text="Finance Pulse" />
            <p style={{ color: "var(--text-tertiary)" }}>Card coming in Phase 3.</p>
          </Panel>
          <Panel>
            <SectionLabel num="03" text="Key Blockers" />
            <p style={{ color: "var(--text-tertiary)" }}>Card coming later.</p>
          </Panel>
        </div>
        <div className="flex flex-col gap-4">
          <Panel>
            <SectionLabel num="04" text="Session" />
            <p style={{ color: "var(--text-tertiary)" }}>Card coming in Phase 2.</p>
          </Panel>
          <Panel>
            <SectionLabel num="05" text="Habit Tracker" />
            <p style={{ color: "var(--text-tertiary)" }}>Card coming in Phase 3.</p>
          </Panel>
          <Panel>
            <SectionLabel num="06" text="Priorities / CRM" />
            <p style={{ color: "var(--text-tertiary)" }}>Card coming in Phase 3.</p>
          </Panel>
        </div>
        <div className="flex flex-col gap-4">
          <Panel>
            <SectionLabel num="07" text="Nutrition" />
            <p style={{ color: "var(--text-tertiary)" }}>Card coming in Phase 3.</p>
          </Panel>
        </div>
      </div>
    </Shell>
  );
}
