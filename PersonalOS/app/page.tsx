import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { Panel } from "@/components/Panel";
import { SectionLabel } from "@/components/SectionLabel";
import { BlueprintPreview } from "@/components/BlueprintPreview";
import { OperatorCard } from "@/components/cards/OperatorCard";
import { SessionCard } from "@/components/cards/SessionCard";
import { HabitTracker } from "@/components/cards/HabitTracker";
import { GoalsCard } from "@/components/cards/GoalsCard";
import { CrmCard } from "@/components/cards/CrmCard";
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
          <OperatorCard />
          <Panel>
            <SectionLabel num="04" text="Finance Pulse" />
            <p style={{ color: "var(--text-tertiary)" }}>
              Needs a Google service account + Anthropic key — set up later.
            </p>
          </Panel>
          <GoalsCard />
        </div>
        <div className="flex flex-col gap-4">
          <SessionCard />
          <HabitTracker />
          <CrmCard />
        </div>
        <div className="flex flex-col gap-4">
          <Panel>
            <SectionLabel num="07" text="Nutrition" />
            <p style={{ color: "var(--text-tertiary)" }}>
              AI meal estimation needs an Anthropic/OpenAI key — set up later.
            </p>
          </Panel>
        </div>
      </div>
    </Shell>
  );
}
