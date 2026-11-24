import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */

export type ToastVariant = "success" | "error" | "warn" | "info";

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number; // ms, default 4000
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
}

/* ─── Context ────────────────────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue | null>(null);

/* ─── Config ─────────────────────────────────────────────────────── */

const config: Record<ToastVariant, { icon: typeof CheckCircle2; color: string; bg: string; border: string }> = {
  success: { icon: CheckCircle2,  color: "text-success-fg", bg: "bg-success-bg", border: "border-success-fg/20" },
  error:   { icon: XCircle,       color: "text-danger-fg",  bg: "bg-danger-bg",  border: "border-danger-fg/20"  },
  warn:    { icon: AlertTriangle, color: "text-warn-fg",    bg: "bg-warn-bg",    border: "border-warn-fg/20"    },
  info:    { icon: Info,          color: "text-info-fg",    bg: "bg-info-bg",    border: "border-info-fg/20"    },
};

/* ─── Single toast ───────────────────────────────────────────────── */

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { icon: Icon, color, bg, border } = config[item.variant];
  const duration = item.duration ?? 4000;

  // Auto-dismiss
  useEffect(() => {
    const t = setTimeout(() => onDismiss(item.id), duration);
    return () => clearTimeout(t);
  }, [item.id, duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 w-80 rounded-lg border px-4 py-3 shadow-lg ${bg} ${border}`}
    >
      <Icon size={16} strokeWidth={1.75} className={`shrink-0 mt-0.5 ${color}`} aria-hidden="true" />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className={`t-body-semi ${color}`}>{item.title}</span>
        {item.description && (
          <span className={`t-caption ${color} opacity-80`}>{item.description}</span>
        )}
      </div>
      <button
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss"
        className={`shrink-0 ${color} opacity-60 hover:opacity-100 transition-opacity mt-0.5`}
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

/* ─── Provider ───────────────────────────────────────────────────── */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...item, id }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div
          aria-label="Notifications"
          className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2.5 items-end"
        >
          {toasts.map((t) => (
            <ToastCard key={t.id} item={t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────────────────────── */

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.toast;
}
