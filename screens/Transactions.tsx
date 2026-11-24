import { useState, useRef, useEffect } from "react";
import {
  Eye, MoreHorizontal, ArrowDownToLine, RefreshCw, FolderX,
  MoveRight, Archive, CheckCircle2, XCircle, Clock, AlertCircle,
  Landmark, FileText, User, Info, Search,
} from "lucide-react";
import { TopBar } from "../components/TopBar";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";
import { Card, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalTabBar, ModalTab } from "../components/ui/Modal";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { TableGrid, TableHead, TableBody, TableGridRow, Th, Td, TableEmpty } from "../components/ui/Table";
import { PageShell, PageHeader } from "../components/ui/PageShell";
import { useToast } from "../components/ui/Toast";
import { useRole } from "../lib/RoleContext";
import { kes } from "../lib/format";
import { deposits as initialDeposits } from "../data/deposits";
import type { Deposit } from "../data/deposits";

/* ─── Constants ──────────────────────────────────────────────────── */
const COLS = "40px 140px 160px 160px 1.6fr 120px 1fr 120px 80px 48px";
const CHANNELS = ["All", "RTGS", "EFT", "M-Pesa", "POS", "SWIFT"];
const PRODUCTS_FILTER = ["All", "Co-op Money Market Fund", "Co-op Bond Fund", "Co-op Fixed Income Gratuity Fund"];

type StageTab = "pending" | "waiting_review" | "invested" | "archived" | "rejected";
const STAGE_TABS: { key: StageTab; label: string }[] = [
  { key: "pending",                label: "Pending" },
  { key: "waiting_review",         label: "Waiting Review" },
  { key: "investment_in_progress", label: "Investment in Progress" },
  { key: "invested",               label: "Invested" },
  { key: "archived",               label: "Archived" },
  { key: "rejected",               label: "Rejected" },
];

/* ─── Helpers ────────────────────────────────────────────────────── */
function statusBadge(d: Deposit) {
  return d.status === "successful"
    ? <Badge variant="success" dot>Successful</Badge>
    : <Badge variant="warn" dot>Unsuccessful</Badge>;
}

function agingBadge(days: number) {
  if (days === 0) return null;
  return <Badge variant={days >= 3 ? "danger" : "warn"}>{days}d</Badge>;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span style={{ fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.04em", fontWeight: 500, color: "#A8A7A1" }}>{label}</span>
      <span className="t-body text-foreground">{value ?? "—"}</span>
    </div>
  );
}

function RowMenu({ items }: { items: { label: string; icon?: React.ReactNode; onClick: () => void; danger?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)} aria-label="Actions"
        className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta">
        <MoreHorizontal size={15} strokeWidth={1.75} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-52 bg-card border border-border rounded-lg shadow-lg py-1">
          {items.map((item, i) => (
            <button key={i} onClick={() => { item.onClick(); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 t-body text-left transition-colors ${item.danger ? "text-danger-fg hover:bg-danger-bg" : "text-foreground hover:bg-muted"}`}>
              {item.icon && <span className="shrink-0" aria-hidden="true">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Deposit detail modal ───────────────────────────────────────── */
function DepositDetailModal({ deposit, onClose, hideAudit = false }: { deposit: Deposit; onClose: () => void; hideAudit?: boolean }) {
  const [tab, setTab] = useState<"details" | "audit">("details");
  return (
    <Modal open onClose={onClose} size="xl">
      <ModalHeader title={deposit.depositId} description={`${deposit.channel} · ${formatTime(deposit.receivedTime)}`}
        adornment={<span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0"><ArrowDownToLine size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" /></span>}
        actions={statusBadge(deposit)} onClose={onClose} />
      <ModalTabBar>
        <ModalTab active={tab === "details"} onClick={() => setTab("details")}><Info size={14} strokeWidth={1.75} aria-hidden="true" /> Details</ModalTab>
        {!hideAudit && <ModalTab active={tab === "audit"} onClick={() => setTab("audit")} badge={deposit.auditTrail.length}><Clock size={14} strokeWidth={1.75} aria-hidden="true" /> Audit Trail</ModalTab>}
      </ModalTabBar>      <ModalBody flush>
        <div className="px-6 py-5 flex flex-col gap-5">
          {tab === "details" && (
            <>
              <div className="rounded-xl px-5 py-4 flex items-center gap-8" style={{ background: "linear-gradient(135deg, #004E38 0%, #006B4F 60%, #005240 100%)" }}>
                <div className="flex flex-col gap-1"><span className="t-label text-white/60">Amount</span><span className="t-heading text-white tabular-nums">{kes(deposit.amount)}</span></div>
                <div className="flex flex-col gap-1"><span className="t-label text-white/60">Currency</span><span className="t-body-med text-white">{deposit.currency}</span></div>
                <div className="flex flex-col gap-1"><span className="t-label text-white/60">Channel</span><span className="t-body-med text-white">{deposit.channel}</span></div>
                {deposit.agingDays > 0 && <div className="ml-auto px-3 py-2 rounded-lg bg-warn-fg/30 border border-white/20"><span className="t-label text-white/70 block">Aging</span><span className="t-body-med text-white">{deposit.agingDays}d</span></div>}
              </div>
              <Card><CardHeader icon={<FileText size={15} strokeWidth={2} aria-hidden="true" />} title="Narration" /><div className="px-5 py-4"><p className="t-body text-foreground bg-muted rounded-md px-4 py-3 font-mono text-sm break-all">{deposit.narration}</p></div></Card>
              <Card><CardHeader icon={<Landmark size={15} strokeWidth={2} aria-hidden="true" />} title="Transaction Details" />
                <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-5">
                  <Field label="Deposit ID" value={deposit.depositId} />
                  <Field label="Received" value={formatTime(deposit.receivedTime)} />
                  <Field label="Posting Date" value={deposit.postingDate} />
                  <Field label="Value Date" value={deposit.valueDate} />
                  <Field label="Collection Account" value={deposit.collectionAccount} />
                  <Field label="Investment Account" value={deposit.investmentAccount} />
                  <Field label="Investment Time" value={deposit.investmentTime ? formatTime(deposit.investmentTime) : null} />
                  <Field label="Channel" value={deposit.channel} />
                  <Field label="Aging" value={deposit.agingDays === 0 ? "Same day" : `${deposit.agingDays} day${deposit.agingDays !== 1 ? "s" : ""}`} />
                </div>
              </Card>
              <Card><CardHeader icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Client & Fund" />
                <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-5">
                  <Field label="Client Account" value={deposit.clientAccount} />
                  <Field label="Account Name" value={deposit.accountName} />
                  <Field label="Fund" value={deposit.fund} />
                  <div className="flex flex-col gap-0.5"><span style={{ fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.04em", fontWeight: 500, color: "#A8A7A1" }}>Status</span><div className="mt-1">{statusBadge(deposit)}</div></div>
                </div>
              </Card>
              {!deposit.clientAccount && <Alert variant="warn" title="Client not identified">No client account was found in the narration. Use Reallocate, Reverse, or Create Unclaimed Account.</Alert>}
              {deposit.stage === "rejected" && deposit.rejectionReason && (
                <Card>
                  <CardHeader icon={<XCircle size={15} strokeWidth={2} aria-hidden="true" />} title="Rejection Details" />
                  <div className="px-5 py-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span style={{ fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.04em", fontWeight: 500, color: "#A8A7A1" }}>Rejection Type</span>
                      <div className="mt-0.5">
                        {deposit.rejectionType === "reverse"
                          ? <Badge variant="danger">Reversed & Rejected — balance deducted</Badge>
                          : <Badge variant="warn">Marked as Rejected — status update only</Badge>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span style={{ fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.04em", fontWeight: 500, color: "#A8A7A1" }}>Reason</span>
                      <p className="t-body text-foreground bg-muted rounded-md px-4 py-3">{deposit.rejectionReason}</p>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
          {tab === "audit" && (
            <div className="flex flex-col gap-0">
              {deposit.auditTrail.map((event, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-cta shrink-0 mt-1" />
                    {i < deposit.auditTrail.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="flex flex-col gap-0.5 pb-5 min-w-0">
                    <span className="t-body-semi">{event.action}</span>
                    <span className="t-caption text-muted-foreground">{event.time} · {event.user}</span>
                    {event.note && <p className="t-body text-muted-foreground mt-1 bg-muted rounded-md px-3 py-2">{event.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Close</Button>
        {deposit.status === "successful" && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" leftIcon={<RefreshCw size={15} strokeWidth={1.75} aria-hidden="true" />} onClick={() => { onClose(); }}>Reallocate</Button>
            <Button variant="danger" leftIcon={<XCircle size={15} strokeWidth={1.75} aria-hidden="true" />} onClick={() => { onClose(); }}>Handle Rejection</Button>
            <Button variant="primary" leftIcon={<MoveRight size={15} strokeWidth={1.75} aria-hidden="true" />} onClick={() => { onClose(); }}>Invest</Button>
          </div>
        )}
        {deposit.status === "unsuccessful" && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" leftIcon={<RefreshCw size={15} strokeWidth={1.75} aria-hidden="true" />} onClick={() => { onClose(); }}>Reallocate</Button>
            <Button variant="secondary" leftIcon={<Archive size={15} strokeWidth={1.75} aria-hidden="true" />} onClick={() => { onClose(); }}>Create Unclaimed</Button>
            <Button variant="danger" leftIcon={<FolderX size={15} strokeWidth={1.75} aria-hidden="true" />} onClick={() => { onClose(); }}>Reverse</Button>
          </div>
        )}
      </ModalFooter>
    </Modal>
  );
}

/* ─── Invest modal ───────────────────────────────────────────────── */
function InvestModal({ deposit, count, totalAmount, onClose, onConfirm }: {
  deposit?: Deposit;
  count?: number;
  totalAmount?: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const isBulk = !deposit && (count ?? 0) > 1;
  const depositCount = count ?? (deposit ? 1 : 0);

  return (
    <Modal open onClose={onClose} size="md">
      <ModalHeader
        title={isBulk ? `Invest ${depositCount} Deposits` : "Submit for Investment"}
        description={deposit ? deposit.depositId : `${depositCount} deposits selected`}
        onClose={onClose}
      />
      <ModalBody>
        <div className="flex flex-col gap-4">
          {isBulk ? (
            <>
              <div className="rounded-xl px-5 py-4 flex items-center gap-8" style={{ background: "linear-gradient(135deg, #004E38 0%, #006B4F 60%, #005240 100%)" }}>
                <div className="flex flex-col gap-1">
                  <span className="t-label text-white/60">Deposits</span>
                  <span className="t-heading text-white tabular-nums">{depositCount}</span>
                </div>
                {totalAmount !== undefined && (
                  <div className="flex flex-col gap-1">
                    <span className="t-label text-white/60">Total Amount</span>
                    <span className="t-heading text-white tabular-nums">{kes(totalAmount)}</span>
                  </div>
                )}
              </div>
              <Alert variant="info">
                All {depositCount} deposits will be moved to <strong>Waiting Review</strong> for checker approval.
              </Alert>
            </>
          ) : (
            <>
              <p className="t-body text-muted-foreground">
                This deposit will move to <strong className="text-foreground">Waiting Review</strong> for checker approval.
              </p>
              {deposit && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Field label="Amount" value={kes(deposit.amount)} />
                  <Field label="Client Account" value={deposit.clientAccount} />
                  <Field label="Account Name" value={deposit.accountName} />
                  <Field label="Fund" value={deposit.fund} />
                </div>
              )}
            </>
          )}

          <label className="flex items-start gap-3 cursor-pointer px-4 py-3.5 rounded-lg border border-border hover:border-cta/40 transition-colors">
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-cta shrink-0" />
            <span className="t-body text-foreground">
              Please confirm that you want to invest {isBulk ? `these ${depositCount} deposits` : "this deposit"}. This action cannot be undone.
            </span>
          </label>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!confirmed} leftIcon={<MoveRight size={15} strokeWidth={1.75} aria-hidden="true" />} onClick={onConfirm}>
          Submit for Approval
        </Button>
      </ModalFooter>
    </Modal>
  );
}

/* ─── Handle Rejection modal ─────────────────────────────────────── */
function HandleRejectionModal({ deposit, onClose, onConfirm }: {
  deposit: Deposit;
  onClose: () => void;
  onConfirm: (type: "reverse" | "reject", reason: string) => void;
}) {
  const [type, setType]     = useState<"reverse" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const canSubmit = !!type && !!reason.trim();

  const OPTIONS = [
    {
      key: "reverse" as const,
      label: "Reverse & Reject",
      description: "Deducts from the deposit balances as a result of an already-done reversal at Finacle level. This cannot be undone.",
      tag: "Permanent — balance reversal applied",
      tagVariant: "danger" as const,
      icon: <FolderX size={18} strokeWidth={1.75} aria-hidden="true" />,
      iconBg: "bg-danger-bg",
      iconColor: "text-danger-fg",
    },
    {
      key: "reject" as const,
      label: "Mark as Rejected",
      description: "Flags the deposit as rejected/invalid in the system without touching any balances or triggering a reversal.",
      tag: "Status update only — no financial changes",
      tagVariant: "warn" as const,
      icon: <XCircle size={18} strokeWidth={1.75} aria-hidden="true" />,
      iconBg: "bg-warn-bg",
      iconColor: "text-warn-fg",
    },
  ];

  return (
    <Modal open onClose={onClose} size="md" disableBackdropClose>
      <ModalHeader
        title="Handle Rejection"
        description={`${deposit.depositId} · ${kes(deposit.amount)}`}
        adornment={<span className="w-10 h-10 rounded-xl bg-danger-fg/10 flex items-center justify-center shrink-0"><XCircle size={18} strokeWidth={1.75} className="text-danger-fg" aria-hidden="true" /></span>}
        onClose={onClose}
      />
      <ModalBody>
        <div className="flex flex-col gap-5">
          <Alert variant="warn">
            Choose how to handle this deposit rejection carefully. The two options have different financial implications.
          </Alert>

          {/* Option cards */}
          <div className="flex flex-col gap-3">
            {OPTIONS.map(opt => (
              <label key={opt.key}
                className={`flex items-start gap-4 px-4 py-4 rounded-xl border-2 cursor-pointer transition-all ${type === opt.key ? "border-cta bg-cta/5" : "border-border hover:border-cta/40"}`}>
                <input type="radio" name="rejection-type" value={opt.key}
                  checked={type === opt.key} onChange={() => setType(opt.key)}
                  className="mt-0.5 accent-cta shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${opt.iconBg}`}>
                      <span className={opt.iconColor}>{opt.icon}</span>
                    </div>
                    <span className="t-body-semi text-foreground">{opt.label}</span>
                  </div>
                  <span className="t-body text-muted-foreground">{opt.description}</span>
                  <span className={`t-label px-2.5 py-1 rounded-full w-fit ${opt.tagVariant === "danger" ? "bg-danger-bg text-danger-fg" : "bg-warn-bg text-warn-fg"}`}>
                    {opt.tag}
                  </span>
                </div>
              </label>
            ))}
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="t-label text-foreground">
              Reason <span className="text-danger-fg">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="Provide a reason for this rejection…"
              className="w-full rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none"
            />
            {!reason.trim() && <span className="t-caption text-danger-fg">A reason is required.</span>}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" disabled={!canSubmit}
          leftIcon={type === "reverse" ? <FolderX size={15} strokeWidth={1.75} aria-hidden="true" /> : <XCircle size={15} strokeWidth={1.75} aria-hidden="true" />}
          onClick={() => onConfirm(type!, reason)}>
          {type === "reverse" ? "Reverse & Reject" : type === "reject" ? "Mark as Rejected" : "Confirm"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}


function ReallocateModal({ deposit, onClose, onConfirm }: {
  deposit: Deposit;
  onClose: () => void;
  onConfirm: (target: string, remarks: string) => void;
}) {
  const [query, setQuery]           = useState("");
  const [resolved, setResolved]     = useState<{ accountNo: string; name: string; fund: string } | null>(null);
  const [searching, setSearching]   = useState(false);
  const [searchError, setSearchError] = useState("");
  const [remarks, setRemarks]       = useState("");
  const [docs, setDocs]             = useState<File[]>([]);
  const fileRef                     = useRef<HTMLInputElement>(null);

  // Simulate account lookup
  function handleSearch() {
    const key = query.trim().toUpperCase();
    if (!key) return;
    setSearching(true);
    setSearchError("");
    setResolved(null);
    setTimeout(() => {
      setSearching(false);
      // Mock — in production this hits the accounts API
      const mock: Record<string, { accountNo: string; name: string; fund: string }> = {
        "BF00201": { accountNo: "BF00201", name: "Peter Kamau", fund: "Co-op Bond Fund" },
        "CL00385": { accountNo: "CL00385", name: "Margaret Nungari Muiruri", fund: "Co-op Money Market Fund" },
        "MM00680": { accountNo: "MM00680", name: "Faith Wanjiru", fund: "Co-op Money Market Fund" },
        "BF00120": { accountNo: "BF00120", name: "Andrew Muiyuro", fund: "Co-op Bond Fund" },
      };
      if (mock[key]) setResolved(mock[key]);
      else setSearchError(`No account found for "${key}". Check the account number and try again.`);
    }, 600);
  }

  const canSubmit = !!resolved && !!remarks.trim();

  return (
    <Modal open onClose={onClose} size="lg" disableBackdropClose>
      <ModalHeader
        title="Reallocate Deposit"
        description="Move this deposit to the correct client account."
        adornment={<span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0"><RefreshCw size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" /></span>}
        onClose={onClose}
      />
      <ModalBody>
        <div className="flex flex-col gap-5">

          {/* Deposit info */}
          <Card>
            <CardHeader icon={<ArrowDownToLine size={15} strokeWidth={2} aria-hidden="true" />} title="Deposit Information" />
            <div className="px-5 py-5 grid grid-cols-3 gap-x-8 gap-y-4">
              <Field label="Deposit ID"         value={deposit.depositId} />
              <Field label="Amount"             value={kes(deposit.amount)} />
              <Field label="From Account"       value={deposit.collectionAccount} />
              <Field label="Current Account"    value={deposit.clientAccount ?? "Unmatched"} />
              <Field label="Received"           value={formatTime(deposit.receivedTime)} />
              <Field label="Channel"            value={deposit.channel} />
            </div>
          </Card>

          {/* Target account search */}
          <Card>
            <CardHeader icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Reallocate To" />
            <div className="px-5 py-5 flex flex-col gap-4">
              <div className="flex items-end gap-2.5">
                <div className="flex-1">
                  <Input
                    label="Target Account Number"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setResolved(null); setSearchError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    placeholder="e.g. BF00201"
                    error={searchError || undefined}
                  />
                </div>
                <Button variant="secondary" size="lg" loading={searching} disabled={!query.trim()} onClick={handleSearch}>
                  Search
                </Button>
              </div>
              {resolved && (
                <div className="rounded-lg border border-success-fg/20 bg-success-bg px-4 py-4 grid grid-cols-3 gap-x-8 gap-y-3">
                  <Field label="Account Number" value={resolved.accountNo} />
                  <Field label="Account Name"   value={resolved.name} />
                  <Field label="Fund"           value={resolved.fund} />
                </div>
              )}
            </div>
          </Card>

          {/* Remarks */}
          <Card>
            <CardHeader icon={<FileText size={15} strokeWidth={2} aria-hidden="true" />} title="Remarks" />
            <div className="px-5 py-5">
              <textarea
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                rows={3}
                placeholder="Explain the reason for this reallocation…"
                className="w-full rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none"
              />
              {!remarks.trim() && <span className="t-caption text-danger-fg mt-1 block">Remarks are required.</span>}
            </div>
          </Card>

          {/* Supporting documents */}
          <Card>
            <CardHeader icon={<FileText size={15} strokeWidth={2} aria-hidden="true" />} title="Supporting Documents" action={<span className="t-caption text-muted-foreground">Optional</span>} />
            <div className="px-5 py-5 flex flex-col gap-3">
              {docs.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-muted rounded-md px-3 py-2.5">
                  <FileText size={14} strokeWidth={1.75} className="text-muted-foreground shrink-0" aria-hidden="true" />
                  <span className="t-caption text-foreground truncate flex-1">{f.name}</span>
                  <button type="button" onClick={() => setDocs(p => p.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-danger-fg transition-colors" aria-label={`Remove ${f.name}`}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
              <div role="button" tabIndex={0}
                onClick={() => fileRef.current?.click()}
                onKeyDown={e => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
                className="flex items-center justify-center gap-2 border border-dashed border-border rounded-lg py-3.5 cursor-pointer hover:border-cta hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span className="t-body text-muted-foreground">Add document</span>
                <span className="t-caption text-muted-foreground">(PDF, JPG, PNG)</span>
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="sr-only"
                onChange={e => { if (e.target.files) setDocs(p => [...p, ...Array.from(e.target.files!)]); e.target.value = ""; }} />
            </div>
          </Card>

        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!canSubmit}
          leftIcon={<RefreshCw size={15} strokeWidth={1.75} aria-hidden="true" />}
          onClick={() => onConfirm(resolved!.accountNo, remarks)}>
          Reallocate
        </Button>
      </ModalFooter>
    </Modal>
  );
}

/* ─── Checker Review modal ───────────────────────────────────────── */
function CheckerReviewModal({ deposit, onClose, onApprove, onReject }: {
  deposit: Deposit;
  onClose: () => void;
  onApprove: (d: Deposit) => void;
  onReject: (d: Deposit) => void;
}) {
  const [confirmingApproval, setConfirmingApproval] = useState(false);
  function submissionLabel() {
    if (deposit.submissionType === "reallocate")     return "Reallocation";
    if (deposit.submissionType === "reject_deposit") return "Deposit Rejection";
    return "Investment";
  }
  function approveLabel() {
    if (deposit.submissionType === "reallocate")     return "Approve Reallocation";
    if (deposit.submissionType === "reject_deposit") return "Confirm Rejection";
    return "Approve Investment";
  }

  // Extract initiator from audit trail — last action before waiting_review
  const initiatorEvent = [...deposit.auditTrail].reverse().find(e =>
    e.action.toLowerCase().includes("submit") || e.action.toLowerCase().includes("reallocat") || e.action.toLowerCase().includes("reject")
  );

  return (<>
    <Modal open onClose={onClose} size="xl">
      <ModalHeader
        title={`Review — ${deposit.depositId}`}
        description={`${submissionLabel()} · ${kes(deposit.amount)}`}
        adornment={
          <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Eye size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" />
          </span>
        }
        onClose={onClose}
      />
      <ModalBody>
        <div className="flex flex-col gap-5">
          {/* Submission type banner */}
          <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-xl">
            <span className="t-body text-muted-foreground">Submission type:</span>
            <span className="t-body-semi text-foreground">{submissionLabel()}</span>
            {deposit.submissionNote && (
              <>
                <span className="text-border">·</span>
                <span className="t-body text-muted-foreground">{deposit.submissionNote}</span>
              </>
            )}
          </div>

          {/* Deposit details */}
          <Card>
            <CardHeader icon={<ArrowDownToLine size={15} strokeWidth={2} aria-hidden="true" />} title="Deposit Details" />
            <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-5">
              <Field label="Deposit ID"          value={deposit.depositId} />
              <Field label="Amount"              value={kes(deposit.amount)} />
              <Field label="Received"            value={formatTime(deposit.receivedTime)} />
              <Field label="Channel"             value={deposit.channel} />
              <Field label="Collection Account"  value={deposit.collectionAccount} />
              <Field label="Client Account"      value={deposit.clientAccount} />
              <Field label="Account Name"        value={deposit.accountName} />
              <Field label="Fund"                value={deposit.fund} />
              <div className="col-span-4">
                <div className="flex flex-col gap-0.5">
                  <span style={{ fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.04em", fontWeight: 500, color: "#A8A7A1" }}>Narration</span>
                  <p className="t-body text-foreground bg-muted rounded-md px-4 py-3 font-mono text-sm mt-1 break-all">{deposit.narration}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Initiator info */}
          <Card>
            <CardHeader icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Initiator" />
            <div className="px-5 py-5 grid grid-cols-3 gap-x-8 gap-y-5">
              <Field label="Submitted by" value={initiatorEvent?.user ?? "—"} />
              <Field label="Submitted at" value={initiatorEvent?.time ?? "—"} />
              <Field label="Submission Note" value={initiatorEvent?.note ?? deposit.submissionNote ?? "—"} />
            </div>
          </Card>
        </div>
      </ModalBody>
      <ModalFooter className="justify-between">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <div className="flex items-center gap-2.5">
          <Button variant="danger" leftIcon={<XCircle size={15} strokeWidth={1.75} aria-hidden="true" />} onClick={() => onReject(deposit)}>
            Reject
          </Button>
          <Button variant="primary" leftIcon={<CheckCircle2 size={15} strokeWidth={1.75} aria-hidden="true" />} onClick={() => setConfirmingApproval(true)}>
            {approveLabel()}
          </Button>
        </div>
      </ModalFooter>
    </Modal>

    {/* Approval confirmation */}
    <ConfirmModal
      open={confirmingApproval}
      onClose={() => setConfirmingApproval(false)}
      onConfirm={() => { setConfirmingApproval(false); onApprove(deposit); }}
      title={`Confirm ${approveLabel()}?`}
      subtitle={`${deposit.depositId} · ${kes(deposit.amount)}`}
      description={`Are you sure you want to ${approveLabel().toLowerCase()} for this deposit? This action will move it to the next stage and cannot be undone.`}
      confirmLabel={approveLabel()}
      cancelLabel="Go back"
    />
  </>);
}

/* ─── Checker Reject modal ───────────────────────────────────────── */
function CheckerRejectModal({ deposit, onClose, onConfirm }: {
  deposit: Deposit;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <Modal open onClose={onClose} size="md" disableBackdropClose>
      <ModalHeader
        title="Reject Submission"
        description={`${deposit.depositId} · ${kes(deposit.amount)}`}
        adornment={<span className="w-10 h-10 rounded-xl bg-danger-bg flex items-center justify-center shrink-0"><XCircle size={18} strokeWidth={1.75} className="text-danger-fg" aria-hidden="true" /></span>}
        onClose={onClose}
      />
      <ModalBody>
        <div className="flex flex-col gap-4">
          <Alert variant="warn">
            Rejecting this submission will return it to <strong>Rejected</strong> status. The maker will be notified.
          </Alert>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Deposit ID"   value={deposit.depositId} />
            <Field label="Amount"       value={kes(deposit.amount)} />
            <Field label="Account"      value={deposit.clientAccount} />
            <Field label="Account Name" value={deposit.accountName} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="t-label text-foreground">Reason for rejection <span className="text-danger-fg">*</span></label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="Explain why this investment submission is being rejected…"
              className="w-full rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none" />
            {!reason.trim() && <span className="t-caption text-danger-fg">A reason is required.</span>}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" disabled={!reason.trim()}
          leftIcon={<XCircle size={15} strokeWidth={1.75} aria-hidden="true" />}
          onClick={() => onConfirm(reason.trim())}>
          Reject Submission
        </Button>
      </ModalFooter>
    </Modal>
  );
}

/* ─── Main screen ────────────────────────────────────────────────── */
export function Deposits() {
  const toast = useToast();
  const { role } = useRole();
  const isChecker = role === "checker" || role === "admin";

  // UI
  const [expandedFund, setExpandedFund]   = useState<string | null>(null);
  const [stageTab, setStageTab] = useState<StageTab>(
    (role === "checker" || role === "admin") ? "waiting_review" : "pending"
  );
  const [showFilters, setShowFilters]     = useState(false);

  // Data
  const [depositList, setDepositList]     = useState<Deposit[]>(initialDeposits);

  // Filters
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<"all" | "successful" | "unsuccessful">("all");
  const [productFilter, setProductFilter] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");
  const [dateField, setDateField]         = useState<"received" | "investment">("received");
  const [dateFrom, setDateFrom]           = useState("");
  const [dateTo, setDateTo]               = useState("");

  // Multiselect
  const [selected, setSelected]           = useState<Set<string>>(new Set());
  const [bulkInvesting, setBulkInvesting] = useState(false);
  const [showBulkInvestModal, setShowBulkInvestModal] = useState(false);
  const masterCheckRef                    = useRef<HTMLInputElement>(null);

  // Modals
  const [viewing, setViewing]                   = useState<Deposit | null>(null);
  const [investing, setInvesting]               = useState<Deposit | null>(null);
  const [reallocating, setReallocating]         = useState<Deposit | null>(null);
  const [reversing, setReversing]               = useState<Deposit | null>(null);
  const [checkerRejecting, setCheckerRejecting] = useState<Deposit | null>(null);
  const [checkerReviewing, setCheckerReviewing] = useState<Deposit | null>(null);
  const [creatingUnclaimed, setCreatingUnclaimed] = useState<Deposit | null>(null);

  /* ── Derived ─────────────────────────────────────────────────── */
  const visibleDeposits = depositList.filter(d => {
    if (d.stage !== stageTab) return false;
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (productFilter !== "All" && d.fund !== productFilter) return false;
    if (channelFilter !== "All" && d.channel !== channelFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (!`${d.depositId} ${d.clientAccount ?? ""} ${d.accountName ?? ""} ${d.narration}`.toLowerCase().includes(q)) return false;
    }
    if (dateFrom || dateTo) {
      const ts = dateField === "received" ? d.receivedTime : d.investmentTime;
      if (!ts) return false;
      if (dateFrom && ts < dateFrom) return false;
      if (dateTo && ts > dateTo + "T23:59:59Z") return false;
    }
    return true;
  });

  const stageCounts = Object.fromEntries(
    STAGE_TABS.map(t => [t.key, depositList.filter(d => d.stage === t.key).length])
  ) as Record<StageTab, number>;
  const selectableIds = visibleDeposits.filter(d => d.status === "successful").map(d => d.depositId);
  const allSelected   = selectableIds.length > 0 && selectableIds.every(id => selected.has(id));
  const someSelected  = selected.size > 0;
  const anyFilterActive = productFilter !== "All" || channelFilter !== "All" || !!dateFrom || !!dateTo;

  useEffect(() => {
    if (masterCheckRef.current) {
      masterCheckRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  /* ── Handlers ────────────────────────────────────────────────── */
  function moveStage(id: string, stage: Deposit["stage"]) {
    setDepositList(prev => prev.map(d => d.depositId === id ? { ...d, stage } : d));
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(selectableIds));
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleInvest(d: Deposit) {
    moveStage(d.depositId, "waiting_review");
    setInvesting(null);
    toast({ variant: "success", title: "Submitted for approval", description: `${d.depositId} moved to Waiting Review.` });
  }

  function handleBulkInvest() {
    setBulkInvesting(true);
    setTimeout(() => {
      setDepositList(prev => prev.map(d => selected.has(d.depositId) ? { ...d, stage: "waiting_review" as const } : d));
      toast({ variant: "success", title: `${selected.size} deposit${selected.size !== 1 ? "s" : ""} submitted`, description: "All selected deposits moved to Waiting Review." });
      setSelected(new Set());
      setBulkInvesting(false);
    }, 800);
  }

  function handleReallocate(d: Deposit, target: string, remarks: string) {
    setDepositList(prev => prev.map(x => x.depositId === d.depositId ? { ...x, stage: "waiting_review" as const, clientAccount: target } : x));
    setReallocating(null);
    toast({ variant: "success", title: "Reallocated", description: `${d.depositId} reallocated to ${target} and moved to Waiting Review.` });
  }

  function handleReverse(d: Deposit, type: "reverse" | "reject", reason: string) {
    moveStage(d.depositId, "rejected");
    setReversing(null);
    const msg = type === "reverse"
      ? `${d.depositId} reversed and rejected. Balance deducted.`
      : `${d.depositId} marked as rejected. No financial changes made.`;
    toast({ variant: type === "reverse" ? "info" : "warn", title: type === "reverse" ? "Reversed & Rejected" : "Marked as Rejected", description: msg });
  }

  function handleCheckerApprove(d: Deposit) {
    setDepositList(prev => prev.map(x => x.depositId === d.depositId ? { ...x, stage: "investment_in_progress" as const } : x));
    toast({ variant: "success", title: "Approved", description: `${d.depositId} moved to Investment in Progress.` });
  }

  function handleCheckerReject(d: Deposit, reason: string) {
    setDepositList(prev => prev.map(x => x.depositId === d.depositId ? { ...x, stage: "rejected" as const, rejectionType: "reject" as const, rejectionReason: reason } : x));
    toast({ variant: "warn", title: "Rejected by checker", description: `${d.depositId} returned to rejected. Reason: ${reason}` });
  }

  function handleCreateUnclaimed(d: Deposit) {
    const acct = `UNC-${Math.floor(100000 + Math.random() * 900000)}`;
    setDepositList(prev => prev.map(x => x.depositId === d.depositId ? { ...x, stage: "archived" as const, clientAccount: acct } : x));
    setCreatingUnclaimed(null);
    toast({ variant: "success", title: "Unclaimed account created", description: `${acct} created and funded with ${kes(d.amount)}.` });
  }

  function clearFilters() { setProductFilter("All"); setChannelFilter("All"); setDateFrom(""); setDateTo(""); }

  function downloadCsv() {
    const headers = "Deposit ID,Received,Client Account,Account Name,Amount,Currency,Fund,Status,Channel,Aging\n";
    const rows = visibleDeposits.map(d =>
      `${d.depositId},${formatTime(d.receivedTime)},${d.clientAccount ?? ""},${d.accountName ?? ""},${d.amount},${d.currency},${d.fund ?? ""},${d.status},${d.channel},${d.agingDays}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `deposits-${stageTab}-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ variant: "success", title: "Downloaded", description: `${visibleDeposits.length} deposits exported.` });
  }

  /* ── Fund metrics ────────────────────────────────────────────── */
  const FUNDS = ["Co-op Money Market Fund", "Co-op Bond Fund", "Co-op Fixed Income Gratuity Fund"];
  const FUND_STYLES: Record<string, { gradient: string; label: string }> = {
    "Co-op Money Market Fund":          { gradient: "linear-gradient(135deg, #0a4a7a 0%, #1565a8 55%, #0d5490 100%)", label: "Money Market Fund" },
    "Co-op Bond Fund":                  { gradient: "linear-gradient(135deg, #004E38 0%, #006B4F 55%, #005240 100%)", label: "Bond Fund" },
    "Co-op Fixed Income Gratuity Fund": { gradient: "linear-gradient(135deg, #8B6914 0%, #C7A034 55%, #A07C20 100%)", label: "Fixed Income Gratuity Fund" },
  };
  const fundMetrics = FUNDS.map(fund => {
    const fd = depositList.filter(d => d.fund === fund);
    const success = fd.filter(d => d.status === "successful").length;
    const failed  = fd.filter(d => d.status === "unsuccessful").length;
    const total   = fd.length;
    const amount  = fd.reduce((s, d) => s + d.amount, 0);
    const rate    = total > 0 ? Math.round((success / total) * 1000) / 10 : 0;
    return { fund, success, failed, total, amount, rate };
  });

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <>
      <TopBar crumbs={[{ label: "Transactions" }, { label: "Deposits" }]} />
      <PageShell>
        <PageHeader title="Deposits" meta="Real-time deposit processing" />

        {/* Metric cards — different for maker vs checker */}
        {isChecker ? (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              {
                label: "Awaiting My Review",
                value: depositList.filter(d => d.stage === "waiting_review").length.toString(),
                sub: "deposits in your inbox",
                color: "text-warn-fg",
                icon: <Clock size={16} strokeWidth={1.75} aria-hidden="true" />,
                iconBg: "bg-warn-bg",
                iconColor: "text-warn-fg",
              },
              {
                label: "Cleared Today",
                value: depositList.filter(d => d.stage === "investment_in_progress").length.toString(),
                sub: "moved to investment in progress",
                color: "text-success-fg",
                icon: <CheckCircle2 size={16} strokeWidth={1.75} aria-hidden="true" />,
                iconBg: "bg-success-bg",
                iconColor: "text-success-fg",
              },
              {
                label: "Total Value Pending",
                value: kes(depositList.filter(d => d.stage === "waiting_review").reduce((s, d) => s + d.amount, 0)),
                sub: "across all waiting submissions",
                color: "text-foreground",
                icon: <Landmark size={16} strokeWidth={1.75} aria-hidden="true" />,
                iconBg: "bg-primary/10",
                iconColor: "text-primary",
              },
            ].map(tile => (
              <div key={tile.label} className="border border-border rounded-xl px-5 py-4 flex flex-col gap-3 bg-card">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tile.iconBg}`}>
                  <span className={tile.iconColor}>{tile.icon}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="t-label text-muted-foreground">{tile.label}</span>
                  <span className={`t-heading tabular-nums ${tile.color}`}>{tile.value}</span>
                  <span className="t-caption text-muted-foreground">{tile.sub}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {fundMetrics.map(m => {
              const isExpanded = expandedFund === m.fund;
            const style = FUND_STYLES[m.fund];
            return (
              <div key={m.fund} className="rounded-2xl overflow-hidden border border-border bg-card flex flex-col shadow-sm">
                <div className="relative px-5 py-4 flex items-center gap-4" style={{ background: style.gradient }}>
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(ellipse at 10% 90%, rgba(255,255,255,0.3) 0%, transparent 60%)" }} />
                  <div className="flex flex-col gap-0.5 flex-1 relative z-10 min-w-0">
                    <span className="t-label text-white/50 tracking-widest">CO-OP</span>
                    <span className="t-body-semi text-white truncate">{style.label}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 relative z-10">
                    <div className="flex flex-col items-end"><span className="t-heading text-white tabular-nums leading-tight">{m.success.toLocaleString()}</span><span className="t-caption text-white/55">Success</span></div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="flex flex-col items-end"><span className="t-subheading text-white/75 tabular-nums leading-tight">{m.failed.toLocaleString()}</span><span className="t-caption text-white/55">Failed</span></div>
                  </div>
                </div>
                <div className="px-5 py-3.5 flex flex-col gap-3 flex-1">
                  <div className="flex flex-col gap-0.5"><span className="t-label text-muted-foreground">Total Amount</span><span className="t-heading tabular-nums">{kes(m.amount)}</span></div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between"><span className="t-label text-muted-foreground">Success Rate</span><span className="t-body-semi" style={{ color: m.rate >= 90 ? "#4A6B0C" : m.rate >= 70 ? "#8A6D12" : "#9B1C1C" }}>{m.rate}%</span></div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={m.rate} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${m.rate}%`, background: m.rate >= 90 ? "#75AF0F" : m.rate >= 70 ? "#C7A034" : "#9B1C1C" }} />
                    </div>
                    <span className="t-caption text-muted-foreground">{m.total} total</span>
                  </div>
                </div>
                <div className="border-t border-border-light">
                  <button type="button" onClick={() => setExpandedFund(isExpanded ? null : m.fund)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-2"><Landmark size={13} strokeWidth={1.75} className="text-muted-foreground" aria-hidden="true" /><span className="t-body text-muted-foreground">Account Balance</span></div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-4 flex flex-col gap-2.5 bg-muted/20">
                      <div className="flex justify-between"><span className="t-caption text-muted-foreground">Collection</span><span className="t-body-med tabular-nums">{kes(m.amount)}</span></div>
                      <div className="flex justify-between"><span className="t-caption text-muted-foreground">Invested</span><span className="t-body-med tabular-nums text-success-fg">{kes(0)}</span></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Stage tabs — filtered by role */}
        <div role="tablist" className="flex gap-6 border-b border-border mb-5">
          {STAGE_TABS.filter(tab =>
            isChecker
              ? ["waiting_review", "investment_in_progress", "invested"].includes(tab.key)
              : true
          ).map(tab => (
            <button key={tab.key} role="tab" aria-selected={stageTab === tab.key}
              onClick={() => { setStageTab(tab.key); setSelected(new Set()); }}
              className={["flex items-center gap-2 py-2.5 -mb-px t-body border-b-2 transition-colors whitespace-nowrap",
                stageTab === tab.key ? "border-cta text-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"].join(" ")}>
              {tab.label}
              <span className="t-caption text-muted-foreground bg-panel rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{stageCounts[tab.key]}</span>
            </button>
          ))}
        </div>

        {/* Pending tab — maker only */}
        {stageTab === "pending" && !isChecker && (
          <div className="flex flex-col gap-4">

            {/* Filter bar */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex-1">
                  <Input placeholder="Search deposit ID, account, narration…" value={search}
                    onChange={e => setSearch(e.target.value)}
                    leftSlot={<Search size={16} strokeWidth={1.75} aria-hidden="true" />} />
                </div>
                <div className="flex gap-1 p-1 bg-muted rounded-lg shrink-0">
                  {(["all", "successful", "unsuccessful"] as const).map(f => (
                    <button key={f} type="button" onClick={() => setStatusFilter(f)}
                      className={`px-3 py-1.5 rounded-md t-body transition-colors whitespace-nowrap capitalize ${statusFilter === f ? "bg-card text-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                      {f === "all" ? "All" : f === "successful" ? "Successful" : "Unsuccessful"}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setShowFilters(v => !v)}
                  className={`flex items-center gap-1.5 h-9 px-3.5 rounded-md border t-body transition-colors shrink-0 ${showFilters || anyFilterActive ? "border-cta bg-cta/5 text-cta" : "border-border text-muted-foreground hover:border-cta/40 hover:text-foreground"}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                  Filters
                  {anyFilterActive && <span className="w-1.5 h-1.5 rounded-full bg-cta" />}
                </button>
                <Button variant="secondary" size="md" leftIcon={<Archive size={15} strokeWidth={1.75} aria-hidden="true" />} onClick={downloadCsv}>
                  Download
                </Button>
              </div>

              {showFilters && (
                <div className="flex items-end gap-3 flex-wrap p-4 bg-muted/40 rounded-xl border border-border">
                  <div className="flex flex-col gap-1.5">
                    <label className="t-label text-foreground">Product</label>
                    <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="h-9 rounded-md border border-border bg-background px-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors">
                      {PRODUCTS_FILTER.map(p => <option key={p} value={p}>{p === "All" ? "All Products" : p.replace("Co-op ", "")}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="t-label text-foreground">Channel</label>
                    <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)} className="h-9 rounded-md border border-border bg-background px-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors">
                      {CHANNELS.map(c => <option key={c} value={c}>{c === "All" ? "All Channels" : c}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="t-label text-foreground">Date by</label>
                    <div className="flex gap-1 p-0.5 bg-muted rounded-md h-9 items-center">
                      {(["received", "investment"] as const).map(f => (
                        <button key={f} type="button" onClick={() => setDateField(f)} className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${dateField === f ? "bg-card text-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                          {f === "received" ? "Received" : "Investment"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5"><label className="t-label text-foreground">From</label><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9 rounded-md border border-border bg-background px-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors" /></div>
                  <div className="flex flex-col gap-1.5"><label className="t-label text-foreground">To</label><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-9 rounded-md border border-border bg-background px-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors" /></div>
                  {anyFilterActive && <button type="button" onClick={clearFilters} className="h-9 px-3 self-end t-body text-muted-foreground hover:text-danger-fg transition-colors">Clear all</button>}
                </div>
              )}
            </div>

            {/* Bulk action bar — maker only */}
            {!isChecker && someSelected && (
              <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
                <span className="t-body-semi text-primary">{selected.size} selected</span>
                <div className="h-4 w-px bg-border" />
                <Button variant="primary" size="sm" loading={bulkInvesting}
                  leftIcon={<MoveRight size={14} strokeWidth={1.75} aria-hidden="true" />}
                  onClick={() => setShowBulkInvestModal(true)}>
                  Invest selected
                </Button>
                <button type="button" onClick={() => setSelected(new Set())} className="ml-auto t-caption text-muted-foreground hover:text-foreground transition-colors">Clear selection</button>
              </div>
            )}

            {/* Table */}
            <TableGrid>
              <TableHead>
                <TableGridRow cols={COLS} head>
                  <Th>
                    {!isChecker && (
                      <input ref={masterCheckRef} type="checkbox" checked={allSelected} onChange={toggleAll}
                        className="w-4 h-4 accent-cta cursor-pointer" aria-label="Select all successful deposits" />
                    )}
                  </Th>
                  <Th>Deposit ID</Th>
                  <Th>Received</Th>
                  <Th>Client Account</Th>
                  <Th>Account Name</Th>
                  <Th align="right">Amount</Th>
                  <Th>Fund</Th>
                  <Th>Status</Th>
                  <Th>Aging</Th>
                  <Th />
                </TableGridRow>
              </TableHead>
              <TableBody>
                {visibleDeposits.length === 0 && <TableEmpty>No deposits match your filters.</TableEmpty>}
                {visibleDeposits.map(d => (
                  <TableGridRow key={d.depositId} cols={COLS}>
                    <Td>
                      {d.status === "successful"
                        ? <input type="checkbox" checked={selected.has(d.depositId)} onChange={() => toggleOne(d.depositId)}
                            className="w-4 h-4 accent-cta cursor-pointer" aria-label={`Select ${d.depositId}`} />
                        : <span />}
                    </Td>
                    <Td>
                      <button onClick={() => setViewing(d)} className="t-body-semi text-cta hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta rounded">{d.depositId}</button>
                    </Td>
                    <Td>
                      <div className="flex flex-col gap-0.5">
                        <span className="t-body">{new Date(d.receivedTime).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        <span className="t-caption text-muted-foreground">{new Date(d.receivedTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </Td>
                    <Td muted={!d.clientAccount}>{d.clientAccount ?? "—"}</Td>
                    <Td muted={!d.accountName}>{d.accountName ?? "—"}</Td>
                    <Td align="right"><span className="t-body-med tabular-nums">{kes(d.amount)}</span></Td>
                    <Td muted={!d.fund}>{d.fund ? d.fund.replace("Co-op ", "") : "—"}</Td>
                    <Td>{statusBadge(d)}</Td>
                    <Td>{agingBadge(d.agingDays)}</Td>
                    <Td>
                      <RowMenu items={d.status === "successful" ? [
                        { label: "View details",     icon: <Eye size={14} strokeWidth={1.75} />, onClick: () => setViewing(d) },
                        { label: "Invest",           icon: <MoveRight size={14} strokeWidth={1.75} />, onClick: () => setInvesting(d) },
                        { label: "Reallocate",       icon: <RefreshCw size={14} strokeWidth={1.75} />, onClick: () => setReallocating(d) },
                        { label: "Handle rejection", icon: <XCircle size={14} strokeWidth={1.75} />, danger: true, onClick: () => setReversing(d) },
                      ] : [
                        { label: "View details",          icon: <Eye size={14} strokeWidth={1.75} />, onClick: () => setViewing(d) },
                        { label: "Reallocate",            icon: <RefreshCw size={14} strokeWidth={1.75} />, onClick: () => setReallocating(d) },
                        { label: "Reverse",               icon: <FolderX size={14} strokeWidth={1.75} />, danger: true, onClick: () => setReversing(d) },
                        { label: "Create unclaimed acct", icon: <Archive size={14} strokeWidth={1.75} />, onClick: () => setCreatingUnclaimed(d) },
                      ]} />
                    </Td>
                  </TableGridRow>
                ))}
              </TableBody>
            </TableGrid>
            <span className="t-body text-muted-foreground">{visibleDeposits.length} deposit{visibleDeposits.length !== 1 ? "s" : ""}</span>
          </div>
        )}

        {/* Waiting Review tab — full table with reject/reallocate actions */}
        {stageTab === "waiting_review" && (() => {
          const rows = visibleDeposits;
          const WR_COLS = isChecker
            ? "140px 160px 160px 1.6fr 120px 1fr 140px 100px"
            : "140px 160px 160px 1.6fr 120px 1fr 120px 48px";

          function submissionBadge(d: Deposit) {
            const t = d.submissionType;
            if (t === "invest")         return <Badge variant="primary">Investment</Badge>;
            if (t === "reallocate")     return <Badge variant="info">Reallocation</Badge>;
            if (t === "reject_deposit") return <Badge variant="warn">Rejection</Badge>;
            return <Badge variant="neutral">Investment</Badge>;
          }

          function checkerApproveLabel(d: Deposit) {
            if (d.submissionType === "reallocate")     return "Approve Reallocation";
            if (d.submissionType === "reject_deposit") return "Confirm Rejection";
            return "Approve";
          }

          function handleApprove(d: Deposit) {
            if (d.submissionType === "reallocate") {
              setDepositList(prev => prev.map(x => x.depositId === d.depositId ? { ...x, stage: "investment_in_progress" as const } : x));
              toast({ variant: "success", title: "Reallocation approved", description: `${d.depositId} reallocation confirmed.` });
            } else if (d.submissionType === "reject_deposit") {
              setDepositList(prev => prev.map(x => x.depositId === d.depositId ? { ...x, stage: "rejected" as const } : x));
              toast({ variant: "info", title: "Rejection confirmed", description: `${d.depositId} marked as rejected.` });
            } else {
              handleCheckerApprove(d);
            }
          }

          return (
            <div className="flex flex-col gap-4">
              <Alert variant="info">
                {isChecker
                  ? "Review submissions below. Each row shows the type of action the maker submitted — approve to confirm or reject to send back."
                  : "These deposits are awaiting checker approval. You can still reallocate or handle rejection before the checker acts."}
              </Alert>
              <TableGrid>
                <TableHead>
                  <TableGridRow cols={WR_COLS} head>
                    <Th>Deposit ID</Th>
                    <Th>Received</Th>
                    <Th>Client Account</Th>
                    <Th>Account Name</Th>
                    <Th align="right">Amount</Th>
                    <Th>Fund</Th>
                    {isChecker
                      ? <Th>Submission Type</Th>
                      : <Th>Status</Th>}
                    <Th />
                  </TableGridRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 && <TableEmpty>No deposits awaiting review.</TableEmpty>}
                  {rows.map(d => (
                    <TableGridRow key={d.depositId} cols={WR_COLS}>
                      <Td><button onClick={() => setViewing(d)} className="t-body-semi text-cta hover:underline">{d.depositId}</button></Td>
                      <Td>
                        <div className="flex flex-col gap-0.5">
                          <span className="t-body">{new Date(d.receivedTime).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                          <span className="t-caption text-muted-foreground">{new Date(d.receivedTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </Td>
                      <Td muted={!d.clientAccount}>{d.clientAccount ?? "—"}</Td>
                      <Td muted={!d.accountName}>{d.accountName ?? "—"}</Td>
                      <Td align="right"><span className="t-body-med tabular-nums">{kes(d.amount)}</span></Td>
                      <Td muted={!d.fund}>{d.fund ? d.fund.replace("Co-op ", "") : "—"}</Td>
                      <Td>
                        {isChecker
                          ? submissionBadge(d)
                          : statusBadge(d)}
                      </Td>
                      <Td>
                        {isChecker ? (
                          <Button variant="secondary" size="sm"
                            leftIcon={<Eye size={13} strokeWidth={1.75} aria-hidden="true" />}
                            onClick={() => setCheckerReviewing(d)}>
                            Review
                          </Button>
                        ) : (
                          <RowMenu items={[
                            { label: "View details",     icon: <Eye size={14} strokeWidth={1.75} />, onClick: () => setViewing(d) },
                            { label: "Reallocate",       icon: <RefreshCw size={14} strokeWidth={1.75} />, onClick: () => setReallocating(d) },
                            { label: "Handle rejection", icon: <XCircle size={14} strokeWidth={1.75} />, danger: true, onClick: () => setReversing(d) },
                          ]} />
                        )}
                      </Td>
                    </TableGridRow>
                  ))}
                </TableBody>
              </TableGrid>
              <span className="t-body text-muted-foreground">{rows.length} deposit{rows.length !== 1 ? "s" : ""} awaiting review</span>
            </div>
          );
        })()}

        {/* Investment in Progress tab — read-only, view only */}
        {stageTab === "investment_in_progress" && (() => {
          const rows = visibleDeposits;
          const IP_COLS = "140px 160px 160px 1.6fr 120px 1fr 120px 48px";
          return (
            <div className="flex flex-col gap-4">
              <Alert variant="info">
                These deposits have been approved and are currently being processed for investment. No further actions are available at this stage.
              </Alert>
              <TableGrid>
                <TableHead>
                  <TableGridRow cols={IP_COLS} head>
                    <Th>Deposit ID</Th>
                    <Th>Received</Th>
                    <Th>Client Account</Th>
                    <Th>Account Name</Th>
                    <Th align="right">Amount</Th>
                    <Th>Fund</Th>
                    <Th>Status</Th>
                    <Th />
                  </TableGridRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 && <TableEmpty>No deposits currently being processed.</TableEmpty>}
                  {rows.map(d => (
                    <TableGridRow key={d.depositId} cols={IP_COLS}>
                      <Td><button onClick={() => setViewing(d)} className="t-body-semi text-cta hover:underline">{d.depositId}</button></Td>
                      <Td>
                        <div className="flex flex-col gap-0.5">
                          <span className="t-body">{new Date(d.receivedTime).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                          <span className="t-caption text-muted-foreground">{new Date(d.receivedTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </Td>
                      <Td muted={!d.clientAccount}>{d.clientAccount ?? "—"}</Td>
                      <Td muted={!d.accountName}>{d.accountName ?? "—"}</Td>
                      <Td align="right"><span className="t-body-med tabular-nums">{kes(d.amount)}</span></Td>
                      <Td muted={!d.fund}>{d.fund ? d.fund.replace("Co-op ", "") : "—"}</Td>
                      <Td><Badge variant="pending" dot>In Progress</Badge></Td>
                      <Td><RowMenu items={[{ label: "View details", icon: <Eye size={14} strokeWidth={1.75} />, onClick: () => setViewing(d) }]} /></Td>
                    </TableGridRow>
                  ))}
                </TableBody>
              </TableGrid>
              <span className="t-body text-muted-foreground">{rows.length} deposit{rows.length !== 1 ? "s" : ""} in progress</span>
            </div>
          );
        })()}

        {/* Other stage tabs — read-only table */}
        {stageTab !== "pending" && stageTab !== "waiting_review" && stageTab !== "investment_in_progress" && (() => {
          const rows = visibleDeposits;
          const RO_COLS = "140px 160px 160px 1.6fr 120px 1fr 120px 48px";
          if (rows.length === 0) return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                {stageTab === "invested"  && <CheckCircle2 size={24} strokeWidth={1.5} className="text-gold" aria-hidden="true" />}
                {stageTab === "archived"  && <Archive      size={24} strokeWidth={1.5} className="text-gold" aria-hidden="true" />}
                {stageTab === "rejected"  && <XCircle      size={24} strokeWidth={1.5} className="text-gold" aria-hidden="true" />}
              </div>
              <p className="t-body-semi capitalize">{stageTab}</p>
              <p className="t-body text-muted-foreground">No deposits in this stage.</p>
            </div>
          );
          return (
            <div className="flex flex-col gap-4">
              <TableGrid>
                <TableHead>
                  <TableGridRow cols={RO_COLS} head>
                    <Th>Deposit ID</Th>
                    <Th>Received</Th>
                    <Th>Client Account</Th>
                    <Th>Account Name</Th>
                    <Th align="right">Amount</Th>
                    <Th>Fund</Th>
                    <Th>Status</Th>
                    <Th />
                  </TableGridRow>
                </TableHead>
                <TableBody>
                  {rows.map(d => (
                    <TableGridRow key={d.depositId} cols={RO_COLS}>
                      <Td><button onClick={() => setViewing(d)} className="t-body-semi text-cta hover:underline">{d.depositId}</button></Td>
                      <Td>
                        <div className="flex flex-col gap-0.5">
                          <span className="t-body">{new Date(d.receivedTime).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                          <span className="t-caption text-muted-foreground">{new Date(d.receivedTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </Td>
                      <Td muted={!d.clientAccount}>{d.clientAccount ?? "—"}</Td>
                      <Td muted={!d.accountName}>{d.accountName ?? "—"}</Td>
                      <Td align="right"><span className="t-body-med tabular-nums">{kes(d.amount)}</span></Td>
                      <Td muted={!d.fund}>{d.fund ? d.fund.replace("Co-op ", "") : "—"}</Td>
                      <Td>
                        {stageTab === "invested"
                          ? <Badge variant="success" dot>Invested</Badge>
                          : stageTab === "rejected"
                            ? <Badge variant="danger" dot>Rejected</Badge>
                            : <Badge variant="neutral" dot>Archived</Badge>}
                      </Td>
                      <Td><RowMenu items={[{ label: "View details", icon: <Eye size={14} strokeWidth={1.75} />, onClick: () => setViewing(d) }]} /></Td>
                    </TableGridRow>
                  ))}
                </TableBody>
              </TableGrid>
              <span className="t-body text-muted-foreground">{rows.length} deposit{rows.length !== 1 ? "s" : ""}</span>
            </div>
          );
        })()}
      </PageShell>

      {/* Modals */}
      {viewing    && <DepositDetailModal deposit={viewing} hideAudit={isChecker} onClose={() => setViewing(null)} />}
      {investing  && <InvestModal deposit={investing} onClose={() => setInvesting(null)} onConfirm={() => handleInvest(investing)} />}
      {showBulkInvestModal && (
        <InvestModal
          count={selected.size}
          totalAmount={depositList.filter(d => selected.has(d.depositId)).reduce((s, d) => s + d.amount, 0)}
          onClose={() => setShowBulkInvestModal(false)}
          onConfirm={() => { setShowBulkInvestModal(false); handleBulkInvest(); }}
        />
      )}
      {reallocating && <ReallocateModal deposit={reallocating} onClose={() => setReallocating(null)} onConfirm={(target, remarks) => handleReallocate(reallocating, target, remarks)} />}
      {reversing && (
        <HandleRejectionModal
          deposit={reversing}
          onClose={() => setReversing(null)}
          onConfirm={(type, reason) => handleReverse(reversing, type, reason)}
        />
      )}
      {checkerReviewing && (
        <CheckerReviewModal
          deposit={checkerReviewing}
          onClose={() => setCheckerReviewing(null)}
          onApprove={(d) => {
            setCheckerReviewing(null);
            // reuse handleApprove logic inline
            if (d.submissionType === "reallocate") {
              setDepositList(prev => prev.map(x => x.depositId === d.depositId ? { ...x, stage: "investment_in_progress" as const } : x));
              toast({ variant: "success", title: "Reallocation approved", description: `${d.depositId} confirmed.` });
            } else if (d.submissionType === "reject_deposit") {
              setDepositList(prev => prev.map(x => x.depositId === d.depositId ? { ...x, stage: "rejected" as const } : x));
              toast({ variant: "info", title: "Rejection confirmed", description: `${d.depositId} marked as rejected.` });
            } else {
              handleCheckerApprove(d);
            }
          }}
          onReject={(d) => { setCheckerReviewing(null); setCheckerRejecting(d); }}
        />
      )}
      {checkerRejecting && (
        <CheckerRejectModal
          deposit={checkerRejecting}
          onClose={() => setCheckerRejecting(null)}
          onConfirm={(reason) => { handleCheckerReject(checkerRejecting, reason); setCheckerRejecting(null); }}
        />
      )}
      <ConfirmModal open={!!creatingUnclaimed} onClose={() => setCreatingUnclaimed(null)} onConfirm={() => creatingUnclaimed && handleCreateUnclaimed(creatingUnclaimed)}
        title="Create unclaimed account?" subtitle={creatingUnclaimed?.depositId}
        description="A new unclaimed account will be created and funded. Interest accrues to CISL until claimed." confirmLabel="Create account" />
    </>
  );
}

export { Deposits as Transactions };
