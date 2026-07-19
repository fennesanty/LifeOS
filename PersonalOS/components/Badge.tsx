export function Badge({
  tier = 2,
  children,
}: {
  tier?: 1 | 2;
  children: React.ReactNode;
}) {
  return <span className={tier === 1 ? "badge-tier1" : "badge-tier2"}>{children}</span>;
}
