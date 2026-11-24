import { Check } from "lucide-react";

export interface Step {
  key: string;
  label: string;
}

interface StepperBarProps {
  steps: Step[];
  current: number; // 0-indexed
}

export function StepperBar({ steps, current }: StepperBarProps) {
  return (
    <div className="flex items-center mb-7">
      {steps.map((step, i) => {
        const done    = i < current;
        const active  = i === current;
        const future  = i > current;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={[
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                done   ? "bg-cta text-white"                                       : "",
                active ? "bg-primary text-white ring-4 ring-primary/20"            : "",
                future ? "bg-muted border-2 border-border text-muted-foreground"   : "",
              ].join(" ")}>
                {done
                  ? <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                  : <span className="t-caption font-semibold">{i + 1}</span>}
              </div>
              <span className={`t-caption whitespace-nowrap ${active ? "text-primary font-semibold" : done ? "text-cta" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
            {/* Connector */}
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 mb-4 transition-colors ${i < current ? "bg-cta" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
