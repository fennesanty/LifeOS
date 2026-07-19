import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { OperatorCard } from "@/components/cards/OperatorCard";
import { SessionCard } from "@/components/cards/SessionCard";
import { HabitTracker } from "@/components/cards/HabitTracker";
import { CalendarCard } from "@/components/cards/CalendarCard";
import { KeyBlockersCard } from "@/components/cards/KeyBlockersCard";
import { FinancePulseCard } from "@/components/cards/FinancePulseCard";
import { NutritionCard } from "@/components/cards/NutritionCard";
import { AUTH_COOKIE, verifySessionToken } from "@/lib/auth";

export default async function Home() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  const ok = await verifySessionToken(token).catch(() => false);
  if (!ok) {
    redirect("/login?from=%2F");
  }

  return (
    <Shell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-3">
        <div className="flex flex-col gap-3">
          <OperatorCard />
          <FinancePulseCard />
          <KeyBlockersCard />
        </div>
        <div className="flex flex-col gap-3">
          <SessionCard />
          <HabitTracker />
          <CalendarCard />
        </div>
        <div className="flex flex-col gap-3">
          <NutritionCard />
        </div>
      </div>
    </Shell>
  );
}
