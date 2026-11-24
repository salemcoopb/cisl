import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  children?: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 select-none whitespace-nowrap";

const variants: Record<ButtonVariant, string> = {
  primary:   "bg-cta hover:bg-cta-hover active:bg-cta-active text-white",
  secondary: "border border-border bg-background hover:bg-muted text-foreground",
  ghost:     "bg-transparent hover:bg-muted text-foreground",
  danger:    "bg-danger-bg hover:bg-danger-fg/10 text-danger-fg border border-danger-fg/20",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8  px-3   text-xs  gap-1.5",
  md: "h-9  px-4   text-sm  gap-2",
  lg: "h-11 px-5   text-sm  gap-2",
};

/** Spinner shown when `loading` is true */
function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/**
 * Core button primitive.
 *
 * ```tsx
 * <Button variant="primary" size="md" leftIcon={<Plus size={15} />}>
 *   Add customer
 * </Button>
 * ```
 */
export function Button({
  variant = "secondary",
  size = "md",
  leftIcon,
  rightIcon,
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? <Spinner /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
