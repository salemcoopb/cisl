import type { ReactNode } from "react";

export type BadgeVariant =
  | "success"
  | "warn"
  | "pending"
  | "danger"
  | "info"
  | "neutral"
  | "primary";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  /** Show a dot indicator before the children */
  dot?: boolean;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  success: "bg-success-bg text-success-fg",
  warn:    "bg-warn-bg    text-warn-fg",
  pending: "bg-pending-bg text-pending-fg",
  danger:  "bg-danger-bg  text-danger-fg",
  info:    "bg-info-bg    text-info-fg",
  neutral: "bg-panel      text-muted-foreground",
  primary: "bg-primary/10 text-primary",
};

const dotColors: Record<BadgeVariant, string> = {
  success: "bg-success-fg",
  warn:    "bg-warn-fg",
  pending: "bg-pending-fg",
  danger:  "bg-danger-fg",
  info:    "bg-info-fg",
  neutral: "bg-muted-foreground",
  primary: "bg-primary",
};

/**
 * Status / label badge — replaces the old `StatusBadge`.
 * Accepts icon children directly.
 *
 * ```tsx
 * <Badge variant="success" dot>KYC Verified</Badge>
 * <Badge variant="warn"><Flag size={12} /> PEP</Badge>
 * ```
 */
export function Badge({ variant = "neutral", dot = false, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 t-label whitespace-nowrap ${styles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// Backward-compat alias — existing code using StatusBadge still works
export { Badge as StatusBadge };
export type { BadgeProps as StatusBadgeProps };
