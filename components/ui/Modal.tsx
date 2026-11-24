import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Modal width preset */
  size?: ModalSize;
  children: ReactNode;
  /** Prevents closing when clicking the backdrop */
  disableBackdropClose?: boolean;
}

const sizes: Record<ModalSize, string> = {
  sm:   "max-w-md",
  md:   "max-w-xl",
  lg:   "max-w-3xl",
  xl:   "max-w-5xl",
  full: "max-w-[calc(100vw-64px)]",
};

/**
 * Base modal container. Use with ModalHeader / ModalBody / ModalFooter.
 *
 * ```tsx
 * <Modal open={open} onClose={() => setOpen(false)} size="xl">
 *   <ModalHeader title="Customer Profile" onClose={() => setOpen(false)} />
 *   <ModalBody>…</ModalBody>
 *   <ModalFooter>…</ModalFooter>
 * </Modal>
 * ```
 */
export function Modal({
  open,
  onClose,
  size = "md",
  children,
  disableBackdropClose = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  // Focus trap — move focus into the panel when it opens
  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px] transition-opacity"
        aria-hidden="true"
        onClick={disableBackdropClose ? undefined : onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={[
          "relative z-10 w-full flex flex-col bg-card rounded-xl shadow-xl",
          "outline-none max-h-[calc(100vh-64px)] overflow-hidden",
          sizes[size],
        ].join(" ")}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ─── ModalHeader ────────────────────────────────────────────────── */

interface ModalHeaderProps {
  title: ReactNode;
  description?: string;
  onClose: () => void;
  /** Optional left-side adornment (e.g. Avatar) */
  adornment?: ReactNode;
  /** Optional right-side actions rendered before the close button */
  actions?: ReactNode;
}

export function ModalHeader({ title, description, onClose, adornment, actions }: ModalHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
      {adornment && <div className="shrink-0">{adornment}</div>}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="t-subheading truncate">{title}</span>
        {description && <span className="t-caption text-muted-foreground">{description}</span>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      <button
        onClick={onClose}
        aria-label="Close"
        className="shrink-0 ml-1 w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta"
      >
        <X size={16} strokeWidth={1.75} />
      </button>
    </div>
  );
}

/* ─── ModalBody ──────────────────────────────────────────────────── */

interface ModalBodyProps {
  children: ReactNode;
  /** Remove default padding — use when content manages its own (e.g. tabs) */
  flush?: boolean;
  className?: string;
}

export function ModalBody({ children, flush = false, className = "" }: ModalBodyProps) {
  return (
    <div className={`flex-1 overflow-y-auto ${flush ? "" : "px-6 py-5"} ${className}`}>
      {children}
    </div>
  );
}

/* ─── ModalFooter ────────────────────────────────────────────────── */

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return (
    <div
      className={`flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border bg-muted/40 shrink-0 ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── ModalTabBar ────────────────────────────────────────────────── */

/**
 * Tab bar designed to sit flush inside a modal — no horizontal padding,
 * connects visually to the header border.
 */
interface ModalTabBarProps {
  children: ReactNode;
  className?: string;
}

export function ModalTabBar({ children, className = "" }: ModalTabBarProps) {
  return (
    <div
      role="tablist"
      className={`flex gap-6 px-6 border-b border-border shrink-0 ${className}`}
    >
      {children}
    </div>
  );
}

interface ModalTabProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  badge?: ReactNode;
}

export function ModalTab({ active, onClick, children, badge }: ModalTabProps) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        "flex items-center gap-2 py-3 -mb-px t-body border-b-2 transition-colors whitespace-nowrap",
        active
          ? "border-cta text-primary font-semibold"
          : "border-transparent text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {children}
      {badge != null && (
        <span className="t-caption text-muted-foreground bg-panel rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </button>
  );
}
