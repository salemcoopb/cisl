import type { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  adornment?: ReactNode;
  className?: string;
}

/**
 * KPI / metric tile used on dashboards and account summaries.
 *
 * ```tsx
 * <StatTile label="Total portfolio value" value={kes(48_250_000)} />
 * ```
 */
export function StatTile({ label, value, sub, adornment, className = "" }: StatTileProps) {
  return (
    <div className={`border border-border rounded-lg px-4 py-3.5 bg-card flex flex-col gap-1 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="t-caption text-muted-foreground">{label}</span>
        {adornment && <span className="shrink-0 text-muted-foreground">{adornment}</span>}
      </div>
      <span className="t-heading tabular-nums">{value}</span>
      {sub && <span className="t-caption text-muted-foreground">{sub}</span>}
    </div>
  );
}
