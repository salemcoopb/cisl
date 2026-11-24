import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

interface FileUploadProps {
  accept?: string;
  hint?: string;
  value?: string | null;       // current file name
  onChange: (file: File | null) => void;
}

/**
 * Drag-and-drop / browse file upload zone.
 *
 * ```tsx
 * <FileUpload
 *   accept=".pdf,.jpg,.png"
 *   hint="PDF, JPG or PNG supported"
 *   value={certFileName}
 *   onChange={(f) => setCertFileName(f?.name ?? null)}
 * />
 * ```
 */
export function FileUpload({ accept = ".pdf,.jpg,.jpeg,.png,.webp", hint, value, onChange }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (files?.[0]) onChange(files[0]);
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave() { setDragging(false); }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    // reset so same file can be re-selected
    e.target.value = "";
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={[
        "flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
        dragging
          ? "border-cta bg-success-bg"
          : value
          ? "border-border bg-muted/40"
          : "border-border bg-background hover:border-cta/50 hover:bg-muted/30",
      ].join(" ")}
    >
      {value ? (
        /* ── File attached state ── */
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-success-bg flex items-center justify-center">
            <FileText size={22} strokeWidth={1.5} className="text-success-fg" aria-hidden="true" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="t-body-med text-foreground">{value}</span>
            <span className="t-caption text-muted-foreground">File attached</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="h-8 px-4 rounded-full bg-cta hover:bg-cta-hover active:bg-cta-active text-white t-caption font-semibold transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="h-8 px-3 rounded-full border border-border hover:bg-muted t-caption text-muted-foreground transition-colors flex items-center gap-1.5"
            >
              <X size={13} strokeWidth={2} aria-hidden="true" /> Remove
            </button>
          </div>
        </div>
      ) : (
        /* ── Empty state ── */
        <div className="flex flex-col items-center gap-3">
          <UploadCloud
            size={40}
            strokeWidth={1.5}
            className={dragging ? "text-cta" : "text-muted-foreground"}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="h-9 px-6 rounded-full bg-cta hover:bg-cta-hover active:bg-cta-active text-white t-body font-semibold transition-colors"
          >
            Browse
          </button>
          <span className="t-caption text-muted-foreground">or drop a file here</span>
          {hint && (
            <span className="t-caption text-muted-foreground">
              <span className="text-danger-fg">*</span> {hint}
            </span>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={onInputChange}
      />
    </div>
  );
}
