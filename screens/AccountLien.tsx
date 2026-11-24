import { useState, useRef, useEffect } from "react";
import { Lock, MoreHorizontal, Eye, Unlock, Plus, Clock, FileCheck2, FileX, FileText, Landmark, User, Info, X } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";
import { Card, CardHeader } from "../components/ui/Card";
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalTabBar, ModalTab } from "../components/ui/Modal";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Input } from "../components/ui/Input";
import { TableGrid, TableHead, TableBody, TableGridRow, Th, Td, TableEmpty } from "../components/ui/Table";
import { PageShell, PageHeader } from "../components/ui/PageShell";
import { useToast } from "../components/ui/Toast";
import { Dropdown } from "../components/Dropdown";
import { liens as initialLiens, pendingLiens } from "../data/liens";
import type { Lien, PendingLien } from "../data/liens";
import { getAccount } from "../data/accounts";
import { kes } from "../lib/format";

type PageTab = "active" | "released" | "submitted";
const LIEN_COLS  = "120px 140px 1fr 160px 160px 48px";
const PEND_COLS  = "140px 1fr 160px 130px 1fr 80px";

/* ─── Row menu ───────────────────────────────────────────────────── */
function RowMenu({ items }: { items: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  return (
    <div ref={ref} className="relative flex items-center justify-end">
      <button aria-label="Actions" aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta">
        <MoreHorizontal size={16} strokeWidth={1.75} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-9 z-20 w-40 bg-card border border-border rounded-md py-1 shadow-lg">
          {items.map(item => (
            <button key={item.label} role="menuitem"
              onClick={() => { setOpen(false); item.onClick(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 t-body transition-colors text-left ${item.danger ? "text-danger-fg hover:bg-danger-bg" : "text-foreground hover:bg-muted"}`}>
              <span className={item.danger ? "text-danger-fg" : "text-muted-foreground"} aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Add Lien modal ─────────────────────────────────────────────── */
export interface AddLienModalProps {
  open: boolean;
  onClose: () => void;
  /** When provided, account is pre-resolved and the lookup step is hidden */
  prefillAccountNo?: string;
}

export function AddLienModal({ open, onClose, prefillAccountNo }: AddLienModalProps) {
  const toast = useToast();

  // When prefilled, we resolve immediately — no manual lookup needed
  const isPrefilled = !!prefillAccountNo;

  const [accountInput, setAccountInput]   = useState(prefillAccountNo ?? "");
  const [accountLookup, setAccountLookup] = useState<ReturnType<typeof getAccount> | null>(() =>
    prefillAccountNo ? (getAccount(prefillAccountNo.toUpperCase()) ?? null) : null
  );
  const [accountError, setAccountError]   = useState("");
  const [lookingUp, setLookingUp]         = useState(false);

  // Sync resolved account if prefillAccountNo changes (e.g. modal re-used for different accounts)
  useEffect(() => {
    if (prefillAccountNo) {
      const found = getAccount(prefillAccountNo.toUpperCase());
      setAccountLookup(found ?? null);
      setAccountInput(prefillAccountNo);
      setAccountError(found ? "" : `No account found for "${prefillAccountNo}".`);
    }
  }, [prefillAccountNo]);

  // Step 2 — lien details (only enabled after account validated)
  const [amount, setAmount]           = useState("");
  const [currency, setCurrency]       = useState("KES");
  const [bankName, setBankName]       = useState("");
  const [branchName, setBranchName]   = useState("");
  const [reason, setReason]           = useState("");
  const [remarks, setRemarks]         = useState("");
  const [files, setFiles]             = useState<File[]>([]);
  const [saving, setSaving]           = useState(false);

  function reset() {
    if (!isPrefilled) { setAccountInput(""); setAccountLookup(null); setAccountError(""); }
    setLookingUp(false);
    setAmount(""); setCurrency("KES"); setBankName(""); setBranchName(""); setReason(""); setRemarks(""); setFiles([]);
  }
  function handleClose() { reset(); onClose(); }

  function lookupAccount() {
    const key = accountInput.trim().toUpperCase();
    if (!key) return;
    setLookingUp(true);
    setAccountError("");
    setAccountLookup(null);
    setTimeout(() => {
      setLookingUp(false);
      const found = getAccount(key);
      if (found) { setAccountLookup(found); }
      else { setAccountError(`No account found for "${key}". Please check the account number and try again.`); }
    }, 400);
  }

  const accountValidated = !!accountLookup;
  const valid = accountValidated && amount.trim() && reason;

  function handleSubmit() {
    if (!valid) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({ variant: "success", title: "Submitted for approval", description: `Lien request for account ${accountLookup!.accountNo} has been submitted to a checker.` });
      handleClose();
    }, 600);
  }

  return (
    <Modal open={open} onClose={handleClose} size="xl" disableBackdropClose={saving}>
      <ModalHeader
        title="Add Lien"
        description={
          isPrefilled && accountLookup
            ? `${accountLookup.accountNo} · ${accountLookup.holderName} · ${accountLookup.product}`
            : "Fill in the details below. This will be submitted to a checker for approval."
        }
        adornment={
          <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Lock size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" />
          </span>
        }
        onClose={handleClose}
      />
      <ModalBody flush>
        <div className="px-6 py-5 flex flex-col gap-5">

          <Alert variant="warn">
            Placing a lien will change the client's available balance in the investment account. Please ensure all information is accurate before proceeding.
          </Alert>

          {/* ── Account section ──
               Prefilled mode: show a read-only summary card.
               Manual mode: show the lookup input + validate button. ── */}
          {isPrefilled ? (
            /* ── Prefilled: read-only account summary ── */
            accountLookup ? (
              <Card>
                <CardHeader icon={<Landmark size={15} strokeWidth={2} aria-hidden="true" />} title="Account" />
                <div className="px-5 py-5">
                  <div className="rounded-lg border border-success-fg/20 bg-success-bg px-4 py-4 grid grid-cols-3 gap-x-8 gap-y-4">
                    <div className="flex flex-col gap-1">
                      <span className="t-label text-success-fg">Account Number</span>
                      <span className="t-body-med text-foreground">{accountLookup.accountNo}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="t-label text-success-fg">Account Name</span>
                      <span className="t-body-med text-foreground">{accountLookup.accountName ?? accountLookup.holderName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="t-label text-success-fg">Account Holder</span>
                      <span className="t-body text-foreground">{accountLookup.holderName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="t-label text-success-fg">Investment Balance</span>
                      <span className="t-body-med text-foreground tabular-nums">{kes(accountLookup.investmentBalance)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="t-label text-success-fg">Total Balance</span>
                      <span className="t-body-med text-foreground tabular-nums">{kes(accountLookup.totalBalance)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="t-label text-success-fg">Product</span>
                      <span className="t-body text-foreground">{accountLookup.product}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="t-label text-success-fg">KYC Status</span>
                      <span className="t-body text-foreground">{accountLookup.kyc}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="t-label text-success-fg">Lien Amount (current)</span>
                      <span className="t-body-med text-foreground tabular-nums">{kes(accountLookup.lienAmount)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Alert variant="danger">{accountError || `Could not resolve account "${prefillAccountNo}".`}</Alert>
            )
          ) : (
            /* ── Manual lookup: input + validate ── */
            <Card>
              <CardHeader icon={<Landmark size={15} strokeWidth={2} aria-hidden="true" />} title="Account" />
              <div className="px-5 py-5 flex flex-col gap-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Input
                      label="Account Number"
                      value={accountInput}
                      onChange={(e) => { setAccountInput(e.target.value); setAccountLookup(null); setAccountError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && lookupAccount()}
                      placeholder="e.g. BF00201"
                      error={accountError || undefined}
                    />
                  </div>
                  <Button variant="secondary" size="lg" loading={lookingUp} onClick={lookupAccount}>
                    Validate
                  </Button>
                </div>

                {/* Account details — shown after successful lookup */}
                {accountLookup && (
                  <div className="rounded-lg border border-success-fg/20 bg-success-bg px-4 py-4 grid grid-cols-3 gap-x-8 gap-y-4">
                    <div className="flex flex-col gap-1">
                      <span className="t-label text-success-fg">Account Name</span>
                      <span className="t-body-med text-foreground">{accountLookup.accountName ?? accountLookup.holderName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="t-label text-success-fg">Account Holder</span>
                      <span className="t-body text-foreground">{accountLookup.holderName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="t-label text-success-fg">Investment Balance</span>
                      <span className="t-body-med text-foreground tabular-nums">{kes(accountLookup.investmentBalance)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="t-label text-success-fg">Total Balance</span>
                      <span className="t-body-med text-foreground tabular-nums">{kes(accountLookup.totalBalance)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="t-label text-success-fg">Product</span>
                      <span className="t-body text-foreground">{accountLookup.product}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="t-label text-success-fg">KYC Status</span>
                      <span className="t-body text-foreground">{accountLookup.kyc}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ── Step 2: Lien details — locked until account validated ── */}
          <div className={accountValidated ? "" : "opacity-40 pointer-events-none select-none"}>
            <Card>
              <CardHeader icon={<Lock size={15} strokeWidth={2} aria-hidden="true" />} title="Lien Details" />
              <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-5">
                <Input label="Lien Amount (KES)" value={amount}     onChange={(e) => setAmount(e.target.value)}     placeholder="e.g. 500000" disabled={!accountValidated} />
                <div className="flex flex-col gap-1.5">
                  <label className="t-label text-foreground">Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={!accountValidated}
                    className="h-11 rounded-md border border-border bg-background px-3.5 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors disabled:bg-muted disabled:cursor-not-allowed">
                    <option>KES</option><option>USD</option><option>EUR</option>
                  </select>
                </div>
                <Input label="Bank Name"   value={bankName}   onChange={(e) => setBankName(e.target.value)}   placeholder="e.g. Co-operative Bank" disabled={!accountValidated} />
                <Input label="Branch Name" value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="e.g. Upper Hill"        disabled={!accountValidated} />
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="t-label text-foreground">Reason <span className="text-danger-fg">*</span></label>
                  <select value={reason} onChange={(e) => setReason(e.target.value)} disabled={!accountValidated}
                    className="h-11 rounded-md border border-border bg-background px-3.5 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors disabled:bg-muted disabled:cursor-not-allowed">
                    <option value="">Select reason…</option>
                    <option>Court Case</option>
                    <option>Suspicious Transactions</option>
                    <option>Tax Dues</option>
                    <option>Regulatory Compliance</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>

          {/* ── Supporting Documents ── */}
          <div className={accountValidated ? "" : "opacity-40 pointer-events-none select-none"}>
            <Card>
              <CardHeader icon={<FileText size={15} strokeWidth={2} aria-hidden="true" />} title="Supporting Documents" />
              <div className="px-5 py-5 flex flex-col gap-3">
                {files.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5 bg-muted rounded-md px-3 py-2.5">
                        <FileText size={14} strokeWidth={1.75} className="text-muted-foreground shrink-0" aria-hidden="true" />
                        <span className="t-caption text-foreground truncate flex-1">{f.name}</span>
                        <button onClick={() => setFiles(p => p.filter((_, idx) => idx !== i))}
                          className="shrink-0 text-muted-foreground hover:text-danger-fg transition-colors" aria-label={`Remove ${f.name}`}>
                          <X size={13} strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center justify-center gap-2.5 border border-dashed border-border rounded-lg py-4 cursor-pointer hover:border-cta hover:bg-muted/30 transition-colors">
                  <Plus size={15} strokeWidth={2} className="text-muted-foreground" aria-hidden="true" />
                  <span className="t-body text-muted-foreground">Add document</span>
                  <span className="t-caption text-muted-foreground">(PDF, JPG, PNG)</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="sr-only"
                    onChange={(e) => { if (e.target.files) setFiles(p => [...p, ...Array.from(e.target.files!)]); e.target.value = ""; }} />
                </label>
              </div>
            </Card>
          </div>

          {/* ── Additional Remarks ── */}
          <div className={accountValidated ? "" : "opacity-40 pointer-events-none select-none"}>
            <Card>
              <CardHeader icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Additional Remarks" />
              <div className="px-5 py-5">
                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3}
                  disabled={!accountValidated}
                  placeholder="Any additional information or context for the checker…"
                  className="w-full rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none disabled:bg-muted disabled:cursor-not-allowed" />
              </div>
            </Card>
          </div>

        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" size="md" onClick={handleClose} disabled={saving}>Cancel</Button>
        <Button variant="primary" size="md" loading={saving} disabled={!valid} onClick={handleSubmit}>
          Submit for approval
        </Button>
      </ModalFooter>
    </Modal>
  );
}

/* ─── Field helper ───────────────────────────────────────────────── */
function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="t-label text-muted-foreground">{label}</span>
      <span className="t-body text-foreground">{value ?? "—"}</span>
    </div>
  );
}

/* ─── View Lien modal ────────────────────────────────────────────── */
function ViewLienModal({ lien, onClose }: { lien: Lien | null; onClose: () => void }) {
  const [tab, setTab] = useState<"details" | "documents">("details");
  useEffect(() => { if (!lien) setTab("details"); }, [lien]);
  if (!lien) return null;

  return (
    <Modal open={!!lien} onClose={onClose} size="xl">
      <ModalHeader
        title={`Lien — ${lien.lienId}`}
        description={`${lien.accountNo} · ${lien.accountHolder}${lien.cifId ? ` · CIF ${lien.cifId}` : ""}`}
        adornment={
          <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Lock size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" />
          </span>
        }
        onClose={onClose}
      />

      <ModalTabBar>
        <ModalTab active={tab === "details"} onClick={() => setTab("details")}>
          <Info size={14} strokeWidth={1.75} aria-hidden="true" /> Lien Details
        </ModalTab>
        <ModalTab active={tab === "documents"} onClick={() => setTab("documents")}
          badge={lien.documents.length}>
          <FileText size={14} strokeWidth={1.75} aria-hidden="true" /> Documents
        </ModalTab>
      </ModalTabBar>

      <ModalBody flush>
        <div className="px-6 py-5 flex flex-col gap-5">
          {tab === "details" && <>
            <Card>
              <CardHeader icon={<Landmark size={15} strokeWidth={2} aria-hidden="true" />} title="Account Information" />
              <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-6">
                <Field label="Account Number" value={lien.accountNo} />
                <Field label="Account Name"   value={lien.accountName} />
                <Field label="Account Holder" value={lien.accountHolder} />
                <Field label="CIF"            value={lien.cifId} />
              </div>
            </Card>

            <Card>
              <CardHeader icon={<Lock size={15} strokeWidth={2} aria-hidden="true" />} title="Lien Details" />
              <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-6">
                <Field label="Lien Amount"    value={kes(lien.amount)} />
                <Field label="Currency"       value={lien.currency} />
                <Field label="Bank Name"      value={lien.bankName} />
                <Field label="Branch Name"    value={lien.branchName} />
                <Field label="Request Date"   value={lien.requestDate} />
                <Field label="Processed Date" value={lien.processedDate} />
                <Field label="Reason"         value={lien.reason} />
                {lien.reasonDetails && (
                  <div className="col-span-4">
                    <Field label="Details" value={lien.reasonDetails} />
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Initiator Details" />
              <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-6">
                <Field label="Initiator Name" value={lien.initiatorName} />
                <div className="col-span-3">
                  <Field label="Initiator Remarks" value={lien.initiatorRemarks} />
                </div>
              </div>
            </Card>

            {lien.status === "released" && lien.releasedBy && (
              <Alert variant="success" title="Lien Released">
                Released by {lien.releasedBy} on {lien.releasedDate}. {lien.releaseReason}
              </Alert>
            )}
          </>}

          {tab === "documents" && (
            <div className="grid grid-cols-3 gap-3">
              {lien.documents.map((doc) => (
                <div key={doc.label} className={`border rounded-lg p-4 flex flex-col gap-3 bg-card ${doc.status === "uploaded" ? "border-border" : "border-dashed border-border"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="t-body-med text-foreground leading-snug">{doc.label}</span>
                    {doc.status === "uploaded"
                      ? <FileCheck2 size={15} strokeWidth={1.75} className="text-success-fg shrink-0 mt-0.5" aria-hidden="true" />
                      : <FileX     size={15} strokeWidth={1.75} className="text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />}
                  </div>
                  {doc.status === "uploaded" ? (
                    <div className="flex items-center gap-2.5 bg-muted rounded-md px-3 py-2.5">
                      <FileText size={14} strokeWidth={1.75} className="text-muted-foreground shrink-0" aria-hidden="true" />
                      <span className="t-caption text-foreground truncate flex-1">{doc.fileName}</span>
                      <Eye size={14} strokeWidth={1.75} className="text-muted-foreground shrink-0" />
                    </div>
                  ) : (
                    <span className="t-caption text-muted-foreground">No file on record</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter><Button variant="ghost" size="md" onClick={onClose}>Close</Button></ModalFooter>
    </Modal>
  );
}

/* ─── Release Lien modal ─────────────────────────────────────────── */
function ReleaseLienModal({ lien, onClose, onSubmit }: {
  lien: Lien | null;
  onClose: () => void;
  onSubmit: (lien: Lien) => void;
}) {
  const [remarks, setRemarks]       = useState("");
  const [files, setFiles]           = useState<File[]>([]);
  const [saving, setSaving]         = useState(false);

  useEffect(() => { if (!lien) { setRemarks(""); setFiles([]); } }, [lien]);

  if (!lien) return null;
  const valid = remarks.trim();

  function handleSubmit() {
    if (!valid) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSubmit(lien);
      onClose();
    }, 600);
  }

  return (
    <Modal open={!!lien} onClose={onClose} size="md" disableBackdropClose={saving}>
      <ModalHeader
        title="Release Lien"
        description={`${lien.lienId} · ${lien.accountNo} · ${lien.accountHolder}`}
        adornment={
          <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Unlock size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" />
          </span>
        }
        onClose={onClose}
      />
      <ModalBody>
        <div className="flex flex-col gap-5">
          <Alert variant="warn">
            Releasing this lien will lift the restriction of {kes(lien.amount)} on account {lien.accountNo}. This requires checker approval.
          </Alert>

          {/* Lien summary */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex flex-col gap-1">
              <span className="t-label text-muted-foreground">Lien Amount</span>
              <span className="t-body font-medium">{kes(lien.amount)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="t-label text-muted-foreground">Reason Placed</span>
              <span className="t-body">{lien.reason}</span>
            </div>
          </div>

          {/* Remarks — required */}
          <div className="flex flex-col gap-1.5">
            <label className="t-label text-foreground">
              Release Remarks <span className="text-danger-fg">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="State the reason for releasing this lien (e.g. court order lifted, matter resolved)…"
              className="rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none"
            />
            {!remarks.trim() && (
              <span className="t-caption text-danger-fg">Remarks are required before submitting.</span>
            )}
          </div>

          {/* Supporting documents — multiple */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="t-label text-foreground">
                Supporting Documents <span className="t-caption text-muted-foreground">(optional)</span>
              </span>
              {files.length > 0 && (
                <span className="t-caption text-muted-foreground">{files.length} file{files.length !== 1 ? "s" : ""} attached</span>
              )}
            </div>

            {/* Uploaded files list */}
            {files.length > 0 && (
              <div className="flex flex-col gap-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-muted rounded-md px-3 py-2.5">
                    <FileText size={14} strokeWidth={1.75} className="text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="t-caption text-foreground truncate flex-1">{f.name}</span>
                    <button
                      onClick={() => setFiles(p => p.filter((_, idx) => idx !== i))}
                      className="shrink-0 text-muted-foreground hover:text-danger-fg transition-colors"
                      aria-label={`Remove ${f.name}`}
                    >
                      <X size={13} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone — always visible to add more */}
            <label className="flex items-center justify-center gap-2.5 border border-dashed border-border rounded-lg py-4 cursor-pointer hover:border-cta hover:bg-muted/30 transition-colors">
              <Plus size={15} strokeWidth={2} className="text-muted-foreground" aria-hidden="true" />
              <span className="t-body text-muted-foreground">Add document</span>
              <span className="t-caption text-muted-foreground">(PDF, JPG, PNG)</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files) setFiles(p => [...p, ...Array.from(e.target.files!)]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="primary" size="md" loading={saving} disabled={!valid} onClick={handleSubmit}>
          Submit for approval
        </Button>
      </ModalFooter>
    </Modal>
  );
}
function TabBar({ active, onChange, counts }: { active: PageTab; onChange: (t: PageTab) => void; counts: Record<PageTab, number> }) {
  const tabs: { key: PageTab; label: string }[] = [
    { key: "active",    label: "Active Liens" },
    { key: "released",  label: "Released" },
    { key: "submitted", label: "Submitted" },
  ];
  return (
    <div className="flex gap-6 border-b border-border mb-5" role="tablist">
      {tabs.map(t => (
        <button key={t.key} role="tab" aria-selected={active === t.key} onClick={() => onChange(t.key)}
          className={["flex items-center gap-2 pb-3 -mb-px t-body border-b-2 transition-colors whitespace-nowrap",
            active === t.key ? "border-cta text-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"].join(" ")}>
          {t.label}
          <span className="t-caption bg-panel text-muted-foreground rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {counts[t.key]}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ─── Screen ─────────────────────────────────────────────────────── */
export function AccountLien() {
  const toast = useToast();
  const [tab, setTab] = useState<PageTab>("active");
  const [addingLien, setAddingLien]   = useState(false);
  const [viewingLien, setViewingLien] = useState<Lien | null>(null);
  const [releasingLien, setReleasingLien] = useState<Lien | null>(null);
  const [lienList, setLienList]           = useState(initialLiens);
  const [pendingList]                     = useState(pendingLiens);
  const [submittedFilter, setSubmittedFilter] = useState("All");
  const [reviewingPending, setReviewingPending] = useState<PendingLien | null>(null);

  const activeLiens   = lienList.filter(l => l.status === "active");
  const releasedLiens = lienList.filter(l => l.status === "released");

  function handleRelease(lien: Lien) {
    setLienList(p => p.map(l => l.lienId === lien.lienId ? { ...l, status: "released" as const } : l));
    toast({ variant: "success", title: "Submitted for approval", description: `Release request for ${lien.lienId} has been submitted to a checker.` });
  }

  return (
    <>
      <TopBar crumbs={[{ label: "Account Maintenance" }, { label: "Account Lien" }]} />
      <PageShell>
        <PageHeader
          title="Account Liens"
          meta={`${activeLiens.length} active · ${releasedLiens.length} released`}
          action={
            <Button variant="primary" size="md" leftIcon={<Plus size={15} strokeWidth={1.75} aria-hidden="true" />} onClick={() => setAddingLien(true)}>
              Add lien
            </Button>
          }
        />

        <TabBar active={tab} onChange={setTab} counts={{ active: activeLiens.length, released: releasedLiens.length, submitted: pendingList.length }} />

        {/* ── ACTIVE LIENS TAB ── */}
        {tab === "active" && (
          <TableGrid>
            <TableHead>
              <TableGridRow cols={LIEN_COLS} head>
                <Th>Lien ID</Th><Th>Account No.</Th><Th>Account Holder</Th>
                <Th>Amount (KES)</Th>
                <Th>Request Date</Th><Th />
              </TableGridRow>
            </TableHead>
            <TableBody>
              {activeLiens.length === 0 ? <TableEmpty>No active liens on record.</TableEmpty>
                : activeLiens.map(l => (
                  <TableGridRow key={l.lienId} cols={LIEN_COLS}>
                    <span className="t-body-med text-primary">{l.lienId}</span>
                    <Td>{l.accountNo}</Td>
                    <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                      <span className="t-body truncate">{l.accountHolder}</span>
                      {l.cifId && <span className="t-caption text-muted-foreground">CIF {l.cifId}</span>}
                    </div>
                    <Td className="tabular-nums font-medium text-warn-fg">{kes(l.amount)}</Td>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={13} strokeWidth={1.75} aria-hidden="true" />
                      <span className="t-caption">{l.requestDate}</span>
                    </div>
                    <RowMenu items={[
                      { label: "View Lien",    icon: <Eye    size={14} strokeWidth={1.75} />, onClick: () => setViewingLien(l) },
                      { label: "Release Lien", icon: <Unlock size={14} strokeWidth={1.75} />, onClick: () => setReleasingLien(l), danger: true },
                    ]} />
                  </TableGridRow>
                ))}
            </TableBody>
          </TableGrid>
        )}

        {/* ── RELEASED LIENS TAB ── */}
        {tab === "released" && (
          <TableGrid>
            <TableHead>
              <TableGridRow cols={LIEN_COLS} head>
                <Th>Lien ID</Th><Th>Account No.</Th><Th>Account Holder</Th>
                <Th>Amount (KES)</Th>
                <Th>Released Date</Th><Th />
              </TableGridRow>
            </TableHead>
            <TableBody>
              {releasedLiens.length === 0 ? <TableEmpty>No released liens on record.</TableEmpty>
                : releasedLiens.map(l => (
                  <TableGridRow key={l.lienId} cols={LIEN_COLS}>
                    <span className="t-body-med text-muted-foreground">{l.lienId}</span>
                    <Td muted>{l.accountNo}</Td>
                    <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                      <span className="t-body truncate text-muted-foreground">{l.accountHolder}</span>
                      {l.cifId && <span className="t-caption text-muted-foreground">CIF {l.cifId}</span>}
                    </div>
                    <Td muted className="tabular-nums line-through">{kes(l.amount)}</Td>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={13} strokeWidth={1.75} aria-hidden="true" />
                      <span className="t-caption">{l.releasedDate ?? l.processedDate}</span>
                    </div>
                    <RowMenu items={[
                      { label: "View Lien", icon: <Eye size={14} strokeWidth={1.75} />, onClick: () => setViewingLien(l) },
                    ]} />
                  </TableGridRow>
                ))}
            </TableBody>
          </TableGrid>
        )}

        {/* ── SUBMITTED TAB — pending + declined ── */}
        {tab === "submitted" && <>
          <div className="flex items-center gap-2.5 mb-4">
            <Dropdown label="Status" value={submittedFilter}
              options={["All", "Pending", "Declined"]}
              onChange={setSubmittedFilter} />
            <span className="t-caption text-muted-foreground ml-1">
              Approved submissions move to Active or Released automatically.
            </span>
          </div>
          {(() => {
            const rows = pendingList.filter(p =>
              submittedFilter === "All" ? true :
              submittedFilter === "Pending" ? p.status === "pending" :
              p.status === "declined"
            );
            return rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                  <Lock size={24} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
                </div>
                <p className="t-body-semi">No submissions</p>
                <p className="t-body text-muted-foreground max-w-xs">
                  {submittedFilter === "Declined" ? "No declined submissions." : "Lien submissions will appear here."}
                </p>
              </div>
            ) : (
              <TableGrid>
                <TableHead>
                  <TableGridRow cols={PEND_COLS} head>
                    <Th>Account No.</Th><Th>Account Holder</Th>
                    <Th>Amount (KES)</Th><Th>Type</Th>
                    <Th>Status</Th><Th>Submitted</Th><Th />
                  </TableGridRow>
                </TableHead>
                <TableBody>
                  {rows.map(p => (
                    <TableGridRow key={p.id} cols="140px 1fr 160px 130px 110px 1fr 80px">
                      <Td>{p.accountNo}</Td>
                      <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                        <span className="t-body truncate">{p.accountHolder}</span>
                        {p.cifId && <span className="t-caption text-muted-foreground">CIF {p.cifId}</span>}
                      </div>
                      <Td className="tabular-nums font-medium">{kes(p.amount)}</Td>
                      <div><Badge variant={p.type === "add" ? "warn" : "info"}>{p.type === "add" ? "Add Lien" : "Release Lien"}</Badge></div>
                      <div><Badge variant={p.status === "declined" ? "danger" : "pending"}>{p.status === "declined" ? "Declined" : "Pending"}</Badge></div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock size={13} strokeWidth={1.75} aria-hidden="true" />
                        <span className="t-caption">{p.submittedAt}</span>
                      </div>
                      <div className="flex items-center justify-end">
                        <Button variant="ghost" size="sm"
                          rightIcon={<Eye size={14} strokeWidth={1.75} aria-hidden="true" />}
                          onClick={() => setReviewingPending(p)}>
                          View
                        </Button>
                      </div>
                    </TableGridRow>
                  ))}
                </TableBody>
              </TableGrid>
            );
          })()}
        </>}

      </PageShell>

      {/* Modals */}
      <AddLienModal open={addingLien} onClose={() => setAddingLien(false)} />
      <ViewLienModal lien={viewingLien} onClose={() => setViewingLien(null)} />
      <ReleaseLienModal
        lien={releasingLien}
        onClose={() => setReleasingLien(null)}
        onSubmit={(l) => { handleRelease(l); setReleasingLien(null); }}
      />

      {/* Submitted lien view modal — full detail same as ViewLienModal */}
      {reviewingPending && (
        <Modal open={!!reviewingPending} onClose={() => setReviewingPending(null)} size="xl">
          <ModalHeader
            title={reviewingPending.type === "add" ? "Add Lien Request" : "Release Lien Request"}
            description={`${reviewingPending.accountNo} · ${reviewingPending.accountHolder}${reviewingPending.cifId ? ` · CIF ${reviewingPending.cifId}` : ""} · Submitted by ${reviewingPending.submittedBy} on ${reviewingPending.submittedAt}`}
            adornment={
              <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Lock size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" />
              </span>
            }
            onClose={() => setReviewingPending(null)}
          />
          <ModalBody flush>
            <div className="px-6 py-5 flex flex-col gap-5">

              {/* Status */}
              {reviewingPending.status === "pending" && (
                <Alert variant="info">This submission is awaiting review by a checker.</Alert>
              )}

              {/* Account Information */}
              <Card>
                <CardHeader icon={<Landmark size={15} strokeWidth={2} aria-hidden="true" />} title="Account Information" />
                <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-6">
                  <Field label="Account Number" value={reviewingPending.accountNo} />
                  <Field label="Account Holder" value={reviewingPending.accountHolder} />
                  <Field label="CIF"            value={reviewingPending.cifId} />
                </div>
              </Card>

              {/* Lien Details */}
              <Card>
                <CardHeader icon={<Lock size={15} strokeWidth={2} aria-hidden="true" />} title="Lien Details" />
                <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-6">
                  <Field label="Lien Amount"  value={kes(reviewingPending.amount)} />
                  <Field label="Currency"     value="KES" />
                  <Field label="Request Type" value={reviewingPending.type === "add" ? "Add Lien" : "Release Lien"} />
                  <Field label="Submitted"    value={reviewingPending.submittedAt} />
                  <div className="col-span-4">
                    <Field label={reviewingPending.type === "add" ? "Reason for lien" : "Reason for release"} value={reviewingPending.reason} />
                  </div>
                </div>
              </Card>

              {/* Initiator Details */}
              <Card>
                <CardHeader icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Initiator Details" />
                <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-6">
                  <Field label="Initiator Name"    value={reviewingPending.submittedBy} />
                  {reviewingPending.type === "release" && reviewingPending.releaseRemarks && (
                    <div className="col-span-3">
                      <Field label="Release Remarks" value={reviewingPending.releaseRemarks} />
                    </div>
                  )}
                </div>
              </Card>

              {/* Decline reason */}
              {reviewingPending.status === "declined" && reviewingPending.checkerComment && (
                <div className="flex flex-col gap-3">
                  <Alert variant="danger" title="Reason for decline">
                    {reviewingPending.checkerComment}
                  </Alert>
                  {(reviewingPending.reviewedBy || reviewingPending.reviewedAt) && (
                    <div className="flex items-center gap-6 px-1">
                      {reviewingPending.reviewedBy && (
                        <div className="flex flex-col gap-0.5">
                          <span className="t-label text-muted-foreground">Declined by</span>
                          <span className="t-body">{reviewingPending.reviewedBy}</span>
                        </div>
                      )}
                      {reviewingPending.reviewedAt && (
                        <div className="flex flex-col gap-0.5">
                          <span className="t-label text-muted-foreground">Declined on</span>
                          <span className="t-body">{reviewingPending.reviewedAt}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" size="md" onClick={() => setReviewingPending(null)}>Close</Button>
            {reviewingPending.status === "declined" && (
              <Button variant="primary" size="md"
                leftIcon={<Plus size={15} strokeWidth={1.75} aria-hidden="true" />}
                onClick={() => { setReviewingPending(null); setAddingLien(true); }}>
                Resubmit
              </Button>
            )}
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
