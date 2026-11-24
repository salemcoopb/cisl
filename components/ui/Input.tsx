import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

/**
 * Text input with optional label, hint, error, and icon slots.
 *
 * ```tsx
 * <Input
 *   label="Account number"
 *   placeholder="e.g. CL00385"
 *   leftSlot={<Search size={16} className="text-muted-foreground" />}
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leftSlot, rightSlot, className = "", id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="t-label text-foreground">
            {label}
          </label>
        )}
        <div
          className={[
            "flex items-center gap-2.5 h-11 rounded-md border px-3.5 bg-background transition-colors",
            "focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/20",
            hasError
              ? "border-danger-fg ring-1 ring-danger-fg/30"
              : "border-border hover:border-muted-foreground",
          ].join(" ")}
        >
          {leftSlot && <span className="shrink-0 text-muted-foreground">{leftSlot}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`flex-1 bg-transparent outline-none t-body placeholder:text-muted-foreground text-foreground ${className}`}
            aria-invalid={hasError}
            aria-describedby={
              hint || error ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          {rightSlot && <span className="shrink-0 text-muted-foreground">{rightSlot}</span>}
        </div>
        {(hint || error) && (
          <span
            id={`${inputId}-hint`}
            className={`t-caption ${hasError ? "text-danger-fg" : "text-muted-foreground"}`}
          >
            {error ?? hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
