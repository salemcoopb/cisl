import type { ReactNode } from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "rounded";

interface AvatarProps {
  /** 1–2 character initials to display */
  initials: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Override background colour — defaults to primary */
  color?: "primary" | "gold" | "cta" | "muted";
  className?: string;
  /** Aria label for screen readers */
  label?: string;
}

const sizes: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: "w-6  h-6",  text: "text-[10px]" },
  sm: { container: "w-8  h-8",  text: "text-xs"  },
  md: { container: "w-10 h-10", text: "text-sm"  },
  lg: { container: "w-12 h-12", text: "text-base" },
  xl: { container: "w-16 h-16", text: "text-xl"  },
};

const colors: Record<NonNullable<AvatarProps["color"]>, string> = {
  primary: "bg-primary text-white",
  gold:    "bg-gold    text-white",
  cta:     "bg-cta     text-white",
  muted:   "bg-panel   text-muted-foreground",
};

const shapes: Record<AvatarShape, string> = {
  circle:  "rounded-full",
  rounded: "rounded-xl",
};

/**
 * Initials avatar.
 *
 * ```tsx
 * <Avatar initials="MN" size="lg" shape="rounded" />
 * ```
 */
export function Avatar({
  initials,
  size = "md",
  shape = "circle",
  color = "primary",
  className = "",
  label,
}: AvatarProps) {
  const { container, text } = sizes[size];
  return (
    <span
      role="img"
      aria-label={label ?? initials}
      className={[
        "inline-flex items-center justify-center shrink-0 font-semibold select-none",
        container,
        text,
        colors[color],
        shapes[shape],
        className,
      ].join(" ")}
    >
      {initials.slice(0, 2).toUpperCase()}
    </span>
  );
}

/* ─── AvatarGroup ────────────────────────────────────────────────── */

interface AvatarGroupProps {
  items: Array<{ initials: string; label?: string }>;
  max?: number;
  size?: AvatarSize;
}

/**
 * Stacked avatar group with overflow count.
 *
 * ```tsx
 * <AvatarGroup items={[{initials:"JM"},{initials:"AK"}]} max={3} />
 * ```
 */
export function AvatarGroup({ items, max = 4, size = "sm" }: AvatarGroupProps) {
  const visible = items.slice(0, max);
  const overflow = items.length - max;
  return (
    <div className="flex items-center -space-x-2">
      {visible.map((it, i) => (
        <Avatar
          key={i}
          initials={it.initials}
          size={size}
          label={it.label}
          className="ring-2 ring-background"
        />
      ))}
      {overflow > 0 && (
        <span
          className={[
            "inline-flex items-center justify-center shrink-0 font-semibold",
            "bg-panel text-muted-foreground ring-2 ring-background",
            sizes[size].container,
            sizes[size].text,
            "rounded-full",
          ].join(" ")}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
