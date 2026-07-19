import { TopRail } from "./TopRail";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopRail />
      <main className="p-6">{children}</main>
    </div>
  );
}
