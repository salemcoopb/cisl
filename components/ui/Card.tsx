import type { HTMLAttributes, ReactNode } from "react";

/* ─── Card ────────────────────────────────────────────────────────── */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Remove default padding from the card body */
  flush?: boolean;
}

/**
 * Bordered surface container.
 *
 * ```tsx
 * <Card>
 *   <CardHeader title="Holdings" action={<Button size="sm">View all</Button>} />
 *   <CardBody>…</CardBody>
 * </Card>
 * ```
 */
export function Card({ children, flush = false, className = "", ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`border border-border rounded-lg overflow-hidden bg-card ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── CardHeader ─────────────────────────────────────────────────── */

interface CardHeaderProps {
  title: ReactNode;
  /** Optional icon placed before the title */
  icon?: ReactNode;
  /** Optional right-side action (button, link, etc.) */
  action?: ReactNode;
  /** Optional supporting description below the title */
  description?: string;
  className?: string;
}

export function CardHeader({ title, icon, action, description, className = "" }: CardHeaderProps) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-border ${className}`}>
      {icon && (
        <span className="shrink-0 w-7 h-7 rounded-md bg-gold flex items-center justify-center [&_svg]:text-white [&_svg]:stroke-white">
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="t-body-semi">{title}</span>
        {description && <span className="t-caption text-muted-foreground">{description}</span>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ─── CardBody ───────────────────────────────────────────────────── */

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardBody({ children, className = "", ...props }: CardBodyProps) {
  return (
    <div {...props} className={`px-4 py-4 ${className}`}>
      {children}
    </div>
  );
}

/* ─── CardFooter ─────────────────────────────────────────────────── */

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className = "", ...props }: CardFooterProps) {
  return (
    <div
      {...props}
      className={`flex items-center justify-between px-4 py-3 border-t border-border bg-muted/50 ${className}`}
    >
      {children}
    </div>
  );
}
