import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * Standard scrollable page body. Wraps screen content with consistent
 * horizontal padding and vertical spacing.
 *
 * ```tsx
 * <>
 *   <TopBar crumbs={…} />
 *   <PageShell>
 *     <PageHeader title="Customers" meta="37,403 total" action={<Button>Export</Button>} />
 *     …
 *   </PageShell>
 * </>
 * ```
 */
export function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div className={`flex-1 overflow-y-auto px-7 py-6 ${className}`}>
      {children}
    </div>
  );
}

/* ─── PageHeader ─────────────────────────────────────────────────── */

interface PageHeaderProps {
  title: string;
  meta?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Consistent screen-level heading block.
 *
 * ```tsx
 * <PageHeader
 *   title="Customers"
 *   meta="37,403 total · 128 flagged"
 *   action={<Button leftIcon={<Download size={15} />}>Export</Button>}
 * />
 * ```
 */
export function PageHeader({ title, meta, action, className = "" }: PageHeaderProps) {
  return (
    <div className={`flex items-end justify-between mb-5 ${className}`}>
      <div className="flex flex-col gap-1">
        <h1 className="t-title">{title}</h1>
        {meta && <p className="t-body text-muted-foreground">{meta}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
