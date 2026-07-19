import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { FinanceDetail } from "@/components/cards/FinanceDetail";
import { AUTH_COOKIE, verifySessionToken } from "@/lib/auth";

export default async function FinancePage() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  const ok = await verifySessionToken(token).catch(() => false);
  if (!ok) {
    redirect("/login?from=%2Ffinance");
  }

  return (
    <Shell>
      <FinanceDetail />
    </Shell>
  );
}
