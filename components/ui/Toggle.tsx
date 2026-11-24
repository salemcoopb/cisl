interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

/**
 * Accessible toggle / switch.
 *
 * ```tsx
 * <Toggle checked={pepPolitical} onChange={setPepPolitical} label="Political affiliation?" />
 * ```
 */
export function Toggle({ checked, onChange, label, description, disabled = false }: ToggleProps) {
  return (
    <label className={`flex items-center justify-between gap-4 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
      {(label || description) && (
        <div className="flex flex-col gap-0.5 flex-1">
          {label && <span className="t-body select-none">{label}</span>}
          {description && <span className="t-caption text-muted-foreground select-none">{description}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={[
          /* track */
          "relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2",
          checked ? "bg-cta" : "bg-border",
          disabled ? "pointer-events-none" : "",
        ].join(" ")}
      >
        {/* thumb */}
        <span
          aria-hidden="true"
          className={[
            "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          ].join(" ")}
        />
      </button>
    </label>
  );
}
