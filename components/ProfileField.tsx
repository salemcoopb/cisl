import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function SectionTitle({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="shrink-0 w-7 h-7 rounded-md bg-gold flex items-center justify-center [&_svg]:text-white [&_svg]:stroke-white">
        <Icon size={15} strokeWidth={2} aria-hidden="true" />
      </span>
      <h3 className="t-subheading">{children}</h3>
    </div>
  );
}

export function Field({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="t-label text-muted-foreground">{label}</span>
      <span className="t-body text-foreground">{value ?? "—"}</span>
    </div>
  );
}
