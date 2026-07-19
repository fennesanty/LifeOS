import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/routeAuth";
import { getDailyNotes, mergeDailyNotes } from "@/lib/dailyLog";
import { localDateKey } from "@/lib/date";

const FINANCE_SENTINEL = "1900-01-02";

const EMPTY_FINANCE = {
  net_worth: 0,
  liquid_cash: 0,
  invested_assets: 0,
  liabilities: 0,
  income_mo: 0,
  burn_mo: 0,
  daily: 0,
  monthly: 0,
  currency: "EUR",
  as_of: null as string | null,
  history: [] as { period: string; net_worth: number; liquid: number; invested: number; liabilities: number }[],
};

export async function GET(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const notes = await getDailyNotes(FINANCE_SENTINEL);
  return NextResponse.json({ finance: { ...EMPTY_FINANCE, ...(notes.finance as object ?? {}) } });
}

export async function POST(req: Request) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const notes = await getDailyNotes(FINANCE_SENTINEL);
  const prev = { ...EMPTY_FINANCE, ...(notes.finance as object ?? {}) };

  const net_worth = Number(body.net_worth ?? prev.net_worth) || 0;
  const liquid_cash = Number(body.liquid_cash ?? prev.liquid_cash) || 0;
  const invested_assets = Number(body.invested_assets ?? prev.invested_assets) || 0;
  const liabilities = Number(body.liabilities ?? prev.liabilities) || 0;
  const income_mo = Number(body.income_mo ?? prev.income_mo) || 0;
  const burn_mo = Number(body.burn_mo ?? prev.burn_mo) || 0;
  const period = localDateKey();

  const history = [
    { period, net_worth, liquid: liquid_cash, invested: invested_assets, liabilities },
    ...prev.history.filter((h) => h.period !== period),
  ].slice(0, 24);

  const finance = {
    net_worth,
    liquid_cash,
    invested_assets,
    liabilities,
    income_mo,
    burn_mo,
    daily: net_worth - prev.net_worth,
    monthly: Number(body.monthly ?? prev.monthly) || 0,
    currency: body.currency || prev.currency,
    as_of: period,
    history,
  };
  await mergeDailyNotes(FINANCE_SENTINEL, { finance });
  return NextResponse.json({ finance });
}
