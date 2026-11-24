import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

/**
 * Filter dropdown — label + selected value trigger, popover list.
 */
export function Dropdown({ label, value, options, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="h-11 px-3.5 border border-border rounded-md flex items-center gap-2 t-body text-foreground hover:border-muted-foreground transition-colors whitespace-nowrap bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-1"
      >
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-medium">{value}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute left-0 z-20 mt-1.5 w-52 bg-card border border-border rounded-md py-1 shadow-lg overflow-hidden"
        >
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <button
                key={opt}
                role="option"
                aria-selected={selected}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full flex items-center px-3 py-2 t-body text-left transition-colors ${
                  selected
                    ? "bg-success-bg text-success-fg font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
