import { Link } from "react-router-dom";
import { Bell, ShieldCheck } from "lucide-react";

export interface Crumb {
  label: string;
  to?: string;
}

export function TopBar({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <header className="h-14 shrink-0 border-b border-border flex items-center px-7 gap-2 bg-background">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-border select-none">/</span>}
            {c.to ? (
              <Link to={c.to} className="text-sm text-cta-hover hover:underline">
                {c.label}
              </Link>
            ) : (
              <span className={`text-sm ${last ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                {c.label}
              </span>
            )}
          </div>
        );
      })}
      <div className="ml-auto flex items-center gap-4 text-muted-foreground">
        <button className="hover:text-foreground transition-colors" aria-label="Compliance alerts">
          <ShieldCheck size={18} strokeWidth={1.75} />
        </button>
        <button className="hover:text-foreground transition-colors" aria-label="Notifications">
          <Bell size={18} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
