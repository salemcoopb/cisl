import { useState } from "react";
import { FileText, FileCheck2, FileClock, FileX, Eye, Download } from "lucide-react";
import { SectionTitle } from "../ProfileField";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import type { Customer, CustomerDoc, DocStatus } from "../../data/customers";

/* ─── Status config ──────────────────────────────────────────────── */

const statusConfig: Record<DocStatus, { label: string; labelColor: string; badgeCls: string }> = {
  verified: { label: "Verified",     labelColor: "text-success-fg", badgeCls: "text-success-fg bg-success-bg" },
  uploaded: { label: "Uploaded",     labelColor: "text-warn-fg",    badgeCls: "text-warn-fg bg-warn-bg"       },
  missing:  { label: "Not provided", labelColor: "text-muted-foreground", badgeCls: "text-muted-foreground bg-panel" },
};

const isImage = (name?: string | null) => !!name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

/* ─── Document preview modal ─────────────────────────────────────── */

function DocPreviewModal({ doc, onClose }: { doc: CustomerDoc | null; onClose: () => void }) {
  const toast = useToast();
  if (!doc) return null;

  function handleDownload() {
    toast({ variant: "success", title: "Download started", description: `${doc!.fileName} is being downloaded.` });
  }

  return (
    <Modal open={!!doc} onClose={onClose} size="lg">
      <ModalHeader
        title={doc.label}
        description={doc.fileName}
        adornment={
          <span className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
            <FileText size={15} strokeWidth={1.75} className="text-muted-foreground" aria-hidden="true" />
          </span>
        }
        onClose={onClose}
      />
      <ModalBody>
        {/* Preview area — real URL would be a signed URL from backend */}
        <div className="rounded-lg border border-border bg-muted flex flex-col items-center justify-center min-h-[360px] gap-3">
          <div className="w-16 h-16 rounded-xl bg-panel flex items-center justify-center">
            <FileText size={28} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
          </div>
          <p className="t-body-med text-foreground">{doc.fileName}</p>
          <p className="t-caption text-muted-foreground">
            {isImage(doc.fileName) ? "Image preview" : "File preview"} not available in this environment
          </p>
        </div>
        {/* Meta row */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex flex-col gap-0.5">
            <span className="t-label text-muted-foreground">Document</span>
            <span className="t-body">{doc.label}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="t-label text-muted-foreground">File name</span>
            <span className="t-body">{doc.fileName}</span>
          </div>
          {doc.date && (
            <div className="flex flex-col gap-0.5">
              <span className="t-label text-muted-foreground">Uploaded</span>
              <span className="t-body">{doc.date}</span>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="t-label text-muted-foreground">Status</span>
            <span className={`t-body ${statusConfig[doc.status].labelColor}`}>
              {statusConfig[doc.status].label}
            </span>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" size="md" onClick={onClose}>Close</Button>
        <Button variant="secondary" size="md"
          leftIcon={<Download size={15} strokeWidth={1.75} aria-hidden="true" />}
          onClick={handleDownload}>
          Download
        </Button>
      </ModalFooter>
    </Modal>
  );
}

/* ─── Doc card — thumbnail + eye button, read-only ───────────────── */

function DocCard({ doc, onPreview }: { doc: CustomerDoc; onPreview: (d: CustomerDoc) => void }) {
  const { label, badgeCls } = statusConfig[doc.status];
  const hasFile = doc.status !== "missing";

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
        <span className="t-body-med text-foreground truncate pr-2">{doc.label}</span>
        <span className={`shrink-0 t-label px-2 py-0.5 rounded-sm ${badgeCls}`}>{label}</span>
      </div>

      <div className="p-4">
        {hasFile ? (
          /* ── Thumbnail area ── */
          <div
            className="relative w-full rounded-md overflow-hidden bg-muted border border-border-light"
            style={{ aspectRatio: "16/9" }}
          >
            {/* Placeholder — in production this would be an <img src={signedUrl}> */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-panel">
              {isImage(doc.fileName) ? (
                <FileCheck2 size={24} strokeWidth={1.5} className="text-success-fg" aria-hidden="true" />
              ) : (
                <FileText size={24} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />
              )}
              <span className="t-caption text-muted-foreground px-4 text-center truncate w-full">{doc.fileName}</span>
            </div>

            {/* Eye overlay */}
            <button
              onClick={() => onPreview(doc)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/40 hover:bg-foreground/60 flex items-center justify-center text-white transition-colors"
              aria-label={`Preview ${doc.label}`}
            >
              <Eye size={14} strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          /* ── No file ── */
          <div
            className="w-full rounded-md border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2"
            style={{ aspectRatio: "16/9" }}
          >
            <FileX size={22} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />
            <span className="t-caption text-muted-foreground">No file on record</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── DocumentsTab ───────────────────────────────────────────────── */

export function DocumentsTab({ customer }: { customer: Customer }) {
  const [preview, setPreview] = useState<CustomerDoc | null>(null);

  const total    = customer.documents.length;
  const provided = customer.documents.filter((d) => d.status !== "missing").length;
  const pct      = Math.round((provided / total) * 100);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-5">
        <SectionTitle icon={FileText}>Customer Documents</SectionTitle>
        <div className="flex items-center gap-3">
          <span className="t-body text-muted-foreground">{provided} of {total} provided</span>
          <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
            aria-label="Document completion"
            className="w-28 h-1.5 rounded-full bg-panel overflow-hidden">
            <div className="h-full bg-cta rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {customer.documents.map((doc) => (
          <DocCard key={doc.label} doc={doc} onPreview={setPreview} />
        ))}
      </div>

      <DocPreviewModal doc={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
