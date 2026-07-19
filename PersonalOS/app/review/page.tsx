import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { WeeklyReview } from "@/components/cards/WeeklyReview";
import { AUTH_COOKIE, verifySessionToken } from "@/lib/auth";

export default async function ReviewPage() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  const ok = await verifySessionToken(token).catch(() => false);
  if (!ok) {
    redirect("/login?from=%2Freview");
  }

  return (
    <Shell>
      <WeeklyReview />
    </Shell>
  );
}
