import { cookies } from "next/headers";
import { AUTH_COOKIE, checkApiSecret, verifySessionToken } from "./auth";

export async function isAuthed(req: Request): Promise<boolean> {
  const apiSecret = req.headers.get("x-api-secret");
  if (checkApiSecret(apiSecret)) return true;
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  return verifySessionToken(token).catch(() => false);
}
