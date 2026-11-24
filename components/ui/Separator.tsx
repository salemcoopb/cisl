interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  /** Decorative gold rule — use for section emphasis */
  decorative?: boolean;
  className?: string;
}

/**
 * Visual divider.
 *
 * ```tsx
 * <Separator />
 * <Separator orientation="vertical" className="h-4" />
 * <Separator decorative />
 * ```
 */
export function Separator({
  orientation = "horizontal",
  decorative = false,
  className = "",
}: SeparatorProps) {
  if (orientation === "vertical") {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        className={`inline-block w-px self-stretch ${decorative ? "bg-gold" : "bg-border"} ${className}`}
      />
    );
  }
  return (
    <hr
      role="separator"
      className={`border-0 ${decorative ? "border-t-2 border-gold" : "border-t border-border"} ${className}`}
    />
  );
}
