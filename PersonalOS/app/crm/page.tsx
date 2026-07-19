import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { CrmCard } from "@/components/cards/CrmCard";
import { GoalsCard } from "@/components/cards/GoalsCard";
import { AUTH_COOKIE, verifySessionToken } from "@/lib/auth";

export default async function CrmPage() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  const ok = await verifySessionToken(token).catch(() => false);
  if (!ok) {
    redirect("/login?from=%2Fcrm");
  }

  return (
    <Shell>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <CrmCard />
        <GoalsCard />
      </div>
    </Shell>
  );
}
