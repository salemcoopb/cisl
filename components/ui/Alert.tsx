import type { ReactNode } from "react";
import { Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export type AlertVariant = "info" | "success" | "warn" | "danger";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  /** Override the default icon */
  icon?: ReactNode;
  className?: string;
}

const config: Record<
  AlertVariant,
  { bg: string; fg: string; Icon: typeof Info }
> = {
  info:    { bg: "bg-info-bg",    fg: "text-info-fg",    Icon: Info },
  success: { bg: "bg-success-bg", fg: "text-success-fg", Icon: CheckCircle2 },
  warn:    { bg: "bg-warn-bg",    fg: "text-warn-fg",    Icon: AlertTriangle },
  danger:  { bg: "bg-danger-bg",  fg: "text-danger-fg",  Icon: XCircle },
};

/**
 * Inline contextual callout.
 *
 * ```tsx
 * <Alert variant="warn" title="PEP flagged">
 *   Enhanced due diligence applies to this customer.
 * </Alert>
 * ```
 */
export function Alert({ variant = "info", title, children, icon, className = "" }: AlertProps) {
  const { bg, fg, Icon } = config[variant];
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-md px-4 py-3 ${bg} ${className}`}
    >
      <span className={`mt-0.5 shrink-0 ${fg}`} aria-hidden="true">
        {icon ?? <Icon size={16} strokeWidth={1.75} />}
      </span>
      <div className={`flex flex-col gap-0.5 ${fg}`}>
        {title && <span className="t-body-semi">{title}</span>}
        <span className="t-body">{children}</span>
      </div>
    </div>
  );
}
