import type { ReactNode, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

/*
 * Lightweight table primitives for data-dense layouts.
 * Works with both standard <table> and CSS grid-based tables.
 *
 * Usage (grid variant — matches existing patterns in the codebase):
 *
 * ```tsx
 * const COLS = "2fr 1.4fr 1fr 80px";
 *
 * <TableGrid cols={COLS}>
 *   <TableHead>
 *     <TableGridRow cols={COLS}>
 *       <Th>Customer</Th>
 *       <Th>ID</Th>
 *       <Th>Onboarded</Th>
 *       <Th align="center">Accounts</Th>
 *     </TableGridRow>
 *   </TableHead>
 *   <TableBody>
 *     {rows.map(r => (
 *       <TableGridRow key={r.id} cols={COLS} interactive onClick={…}>
 *         <Td>{r.name}</Td>
 *         …
 *       </TableGridRow>
 *     ))}
 *   </TableBody>
 * </TableGrid>
 * ```
 */

/* ─── Grid table wrapper ─────────────────────────────────────────── */

interface TableGridProps {
  cols: string;
  children: ReactNode;
  className?: string;
}

export function TableGrid({ children, className = "" }: Omit<TableGridProps, "cols">) {
  return (
    <div className={`border border-border rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

/* ─── Table sections ─────────────────────────────────────────────── */

export function TableHead({ children, className = "" }: HTMLAttributes<HTMLDivElement>) {
  return <div className={className}>{children}</div>;
}

export function TableBody({ children, className = "" }: HTMLAttributes<HTMLDivElement>) {
  return <div className={className}>{children}</div>;
}

/* ─── Grid row ───────────────────────────────────────────────────── */

interface TableGridRowProps extends HTMLAttributes<HTMLDivElement> {
  cols: string;
  children: ReactNode;
  /** Makes the row keyboard-interactive (adds hover + cursor + focus ring) */
  interactive?: boolean;
  head?: boolean;
}

export function TableGridRow({
  cols,
  children,
  interactive = false,
  head = false,
  className = "",
  ...props
}: TableGridRowProps) {
  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      style={{ gridTemplateColumns: cols }}
      className={[
        "grid items-center px-5 transition-colors",
        head
          ? "py-2.5 bg-muted border-b border-border"
          : "py-3.5 border-t border-border-light hover:bg-muted/60",
        interactive
          ? "cursor-pointer hover:bg-muted focus-visible:outline-none focus-visible:bg-muted"
          : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Cell primitives ────────────────────────────────────────────── */

type Align = "left" | "center" | "right";

const alignClass: Record<Align, string> = {
  left:   "text-left",
  center: "text-center",
  right:  "text-right",
};

interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  children?: ReactNode;
  /** Make this column sortable. Pass current sort direction or undefined if not active. */
  sort?: "asc" | "desc" | null;
  onSort?: () => void;
}

/** Column header cell */
export function Th({ align = "left", sort, onSort, children, className = "", ...props }: ThProps) {
  const sortable = !!onSort;
  return (
    <span
      role={sortable ? "button" : undefined}
      tabIndex={sortable ? 0 : undefined}
      onClick={sortable ? onSort : undefined}
      onKeyDown={sortable ? (e) => e.key === "Enter" && onSort?.() : undefined}
      className={[
        "t-label text-muted-foreground",
        alignClass[align],
        sortable ? "inline-flex items-center gap-1 cursor-pointer select-none hover:text-foreground transition-colors focus-visible:outline-none focus-visible:text-foreground" : "",
        className,
      ].join(" ")}
      {...(props as HTMLAttributes<HTMLSpanElement>)}
    >
      {children}
      {sortable && (
        <span className="flex flex-col shrink-0" aria-hidden="true">
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className={sort === "asc" ? "text-foreground" : "text-border"}>
            <path d="M4 0L8 5H0L4 0Z" fill="currentColor" />
          </svg>
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className={sort === "desc" ? "text-foreground" : "text-border"}>
            <path d="M4 5L0 0H8L4 5Z" fill="currentColor" />
          </svg>
        </span>
      )}
    </span>
  );
}

interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  muted?: boolean;
  children?: ReactNode;
}

/** Data cell */
export function Td({ align = "left", muted = false, children, className = "", ...props }: TdProps) {
  return (
    <span
      className={`t-body ${muted ? "text-muted-foreground" : "text-foreground"} ${alignClass[align]} ${className}`}
      {...(props as HTMLAttributes<HTMLSpanElement>)}
    >
      {children}
    </span>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */

export function TableEmpty({ children }: { children?: ReactNode }) {
  return (
    <div className="px-5 py-12 text-center t-body text-muted-foreground border-t border-border-light">
      {children ?? "No results found."}
    </div>
  );
}
