import { useState, useRef, useEffect } from "react";
import {
  Plus, Eye, MoreHorizontal, FileEdit, RefreshCw,
  CheckCircle2, XCircle, AlertCircle, Clock,
  ArrowUpFromLine, User, Landmark, CreditCard,
  Smartphone, FileText, Info, Search, ThumbsUp, CornerUpLeft,
  PenLine, Upload,
} from "lucide-react";
import { TopBar } from "../components/TopBar";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";
import { Card, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalTabBar, ModalTab } from "../components/ui/Modal";
import { TableGrid, TableHead, TableBody, TableGridRow, Th, Td, TableEmpty } from "../components/ui/Table";
import { PageShell, PageHeader } from "../components/ui/PageShell";
import { useToast } from "../components/ui/Toast";
import { kes } from "../lib/format";
import { getAccount } from "../data/accounts";
import { getCustomer } from "../data/customers";
import { withdrawals as initialWithdrawals } from "../data/withdrawals";
import type { Withdrawal, WithdrawalStage } from "../data/withdrawals";
import { useRole } from "../lib/RoleContext";

/* ─── Helpers ────────────────────────────────────────────────────── */
function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span style={{ fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.04em", fontWeight: 500, color: "#A8A7A1" }}>{label}</span>
      <span className="t-body text-foreground">{value ?? "—"}</span>
    </div>
  );
}

function stageBadge(stage: WithdrawalStage) {
  switch (stage) {
    case "needs_action":     return <Badge variant="danger" dot>Needs Action</Badge>;
    case "pending_checker":  return <Badge variant="warn" dot>Pending Checker</Badge>;
    case "pending_approver": return <Badge variant="pending" dot>Pending Approver</Badge>;
    case "processing":       return <Badge variant="info" dot>Processing</Badge>;
    case "disbursed":        return <Badge variant="success" dot>Disbursed</Badge>;
    case "failed":           return <Badge variant="danger" dot>Failed</Badge>;
  }
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
        <div className="absolute right-0 top-full mt-1 z-30 w-48 bg-card border border-border rounded-lg shadow-lg py-1">
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

/* ─── Withdrawal Form Modal ──────────────────────────────────────── */
function WithdrawalForm({ prefill, onClose, onSubmit }: {
  prefill?: Withdrawal;
  onClose: () => void;
  onSubmit: (data: Partial<Withdrawal>) => void;
}) {
  const [accountInput, setAccountInput] = useState(prefill?.investmentAccountNo ?? "");
  const [resolvedAccount, setResolvedAccount] = useState<ReturnType<typeof getAccount> | null>(
    prefill ? (getAccount(prefill.investmentAccountNo) ?? null) : null
  );
  const [accountError, setAccountError] = useState("");
  const [lookingUp, setLookingUp]       = useState(false);
  const [amount, setAmount]             = useState(prefill ? String(prefill.requestedAmount) : "");
  const [paymentMethod, setPaymentMethod] = useState<"primary" | "secondary">("primary");
  const [docs, setDocs]                 = useState<File[]>([]);
  const [submitting, setSubmitting]     = useState(false);
  const fileRef                         = useRef<HTMLInputElement>(null);

  function lookupAccount() {
    const key = accountInput.trim().toUpperCase();
    if (!key) return;
    setLookingUp(true); setAccountError(""); setResolvedAccount(null);
    setTimeout(() => {
      setLookingUp(false);
      const found = getAccount(key);
      if (found) setResolvedAccount(found);
      else setAccountError(`No account found for "${key}".`);
    }, 600);
  }

  const primary   = resolvedAccount?.primaryWithdrawal;
  const secondary = resolvedAccount?.secondaryWithdrawal;
  const selectedMethod = paymentMethod === "primary" ? primary : secondary;
  const amountNum = parseFloat(amount.replace(/,/g, "")) || 0;
  const overBalance = resolvedAccount && amountNum > resolvedAccount.availableCash;
  const canSubmit = !!resolvedAccount && amountNum > 0 && !overBalance;

  function handleSubmit() {
    if (!canSubmit || !resolvedAccount) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmit({
        investmentAccountNo: resolvedAccount.accountNo,
        accountName: resolvedAccount.holderName,
        accountNumber: selectedMethod?.method === "bank" ? selectedMethod.accountNumber : selectedMethod?.method === "mobile" ? selectedMethod.phoneNumber : "",
        availableBalance: resolvedAccount.availableCash,
        requestedAmount: amountNum,
        paymentMethod: selectedMethod?.method === "bank" ? "bank" : "mobile",
        paymentDetails: selectedMethod?.method === "bank"
          ? `${selectedMethod.bankName} · ${selectedMethod.accountNumber}`
          : selectedMethod?.method === "mobile"
            ? `${selectedMethod.provider} · ${selectedMethod.phoneNumber}`
            : "",
        signingInstructions: resolvedAccount.signingInstructions ?? "Single signatory.",
      });
      onClose();
    }, 800);
  }

  const isEdit = !!prefill;

  return (
    <Modal open onClose={onClose} size="xl" disableBackdropClose>
      <ModalHeader
        title={isEdit ? "Edit & Resubmit Withdrawal" : "New Withdrawal Request"}
        description="Complete all sections before submitting."
        adornment={<span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0"><ArrowUpFromLine size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" /></span>}
        onClose={onClose}
      />
      <ModalBody flush>
        <div className="px-6 py-5 flex flex-col gap-5">
          {isEdit && prefill?.returnReason && (
            <Alert variant="warn" title="Returned — action required">
              {prefill.returnReason}
            </Alert>
          )}

          {/* 1. Account Lookup */}
          <Card>
            <CardHeader icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Client Account" />
            <div className="px-5 py-5 flex flex-col gap-4">
              <div className="flex items-end gap-2.5">
                <div className="flex-1">
                  <Input label="Investment Account Number *" value={accountInput}
                    onChange={e => { setAccountInput(e.target.value); setResolvedAccount(null); setAccountError(""); }}
                    onKeyDown={e => e.key === "Enter" && lookupAccount()}
                    placeholder="e.g. BF00201" error={accountError || undefined}
                    leftSlot={<Search size={15} strokeWidth={1.75} aria-hidden="true" />} />
                </div>
                <Button variant="secondary" size="lg" loading={lookingUp} disabled={!accountInput.trim()} onClick={lookupAccount}>
                  Validate
                </Button>
              </div>
              {resolvedAccount && (
                <>
                  {/* Balance hero */}
                  <div className="rounded-xl overflow-hidden">
                    <div className="px-5 py-4 flex items-center gap-8" style={{ background: "linear-gradient(135deg, #004E38 0%, #006B4F 60%, #005240 100%)" }}>
                      <div className="flex flex-col gap-1">
                        <span className="t-label text-white/60">Available Balance</span>
                        <span className="t-heading text-white tabular-nums">{kes(resolvedAccount.availableCash)}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="t-label text-white/60">Account Name</span>
                        <span className="t-body-med text-white">{resolvedAccount.holderName}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="t-label text-white/60">Fund</span>
                        <span className="t-body-med text-white">{resolvedAccount.product}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* 2. Amount */}
          <Card>
            <CardHeader icon={<Landmark size={15} strokeWidth={2} aria-hidden="true" />} title="Withdrawal Amount" />
            <div className="px-5 py-5">
              <div className="max-w-xs">
                <Input label="Amount (KES) *" id="withdrawal-amount" value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 500000"
                  disabled={!resolvedAccount}
                  error={overBalance ? `Amount exceeds available balance of ${kes(resolvedAccount!.availableCash)}` : undefined} />
              </div>
            </div>
          </Card>

          {/* 3. Payment Method */}
          <Card>
            <CardHeader icon={<CreditCard size={15} strokeWidth={2} aria-hidden="true" />} title="Payment Method" />
            <div className="px-5 py-5 flex flex-col gap-4">
              {!resolvedAccount && <p className="t-body text-muted-foreground">Validate an account first to see payment methods.</p>}
              {resolvedAccount && (
                <>
                  {/* Method selector — dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="t-label text-foreground">Select Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as "primary" | "secondary")}
                      className="h-11 rounded-md border border-border bg-background px-3.5 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors"
                    >
                      <option value="primary">
                        Primary — {primary?.method === "bank" ? `Bank · ${(primary as any).bankName}` : primary?.method === "mobile" ? `Mobile · ${(primary as any).provider}` : "Not set"}
                      </option>
                      {secondary && (
                        <option value="secondary">
                          Secondary — {secondary.method === "bank" ? `Bank · ${(secondary as any).bankName}` : `Mobile · ${(secondary as any).provider}`}
                        </option>
                      )}
                    </select>
                  </div>
                  {/* Selected method details */}
                  {selectedMethod && (
                    <div className="rounded-lg border border-border bg-muted/30 px-4 py-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                        {selectedMethod.method === "bank"
                          ? <CreditCard size={14} strokeWidth={1.75} className="text-muted-foreground" aria-hidden="true" />
                          : <Smartphone size={14} strokeWidth={1.75} className="text-muted-foreground" aria-hidden="true" />}
                      </div>
                      <div className="flex flex-col gap-3 flex-1">
                        <span className="t-body-semi">{selectedMethod.method === "bank" ? "Bank Transfer" : "Mobile Money"}</span>
                        {selectedMethod.method === "bank" && (
                          <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                            <Field label="Bank Name" value={selectedMethod.bankName} />
                            <Field label="Account Number" value={selectedMethod.accountNumber} />
                            <Field label="Account Name" value={selectedMethod.accountName} />
                            {selectedMethod.branch && <Field label="Branch" value={selectedMethod.branch} />}
                          </div>
                        )}
                        {selectedMethod.method === "mobile" && (
                          <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                            <Field label="Provider" value={selectedMethod.provider} />
                            <Field label="Phone Number" value={selectedMethod.phoneNumber} />
                            <Field label="Name" value={selectedMethod.accountName} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* 4. Signing Instructions + Documents */}
          <Card>
            <CardHeader icon={<FileText size={15} strokeWidth={2} aria-hidden="true" />} title="Signing Instructions & Documents" />
            <div className="px-5 py-5 flex flex-col gap-4">
              {resolvedAccount?.signingInstructions ? (
                <div className="flex flex-col gap-1.5">
                  <span className="t-label text-muted-foreground">Signing Instructions</span>
                  <p className="t-body text-foreground bg-muted rounded-md px-4 py-3">{resolvedAccount.signingInstructions}</p>
                </div>
              ) : (
                <p className="t-body text-muted-foreground">Validate an account to see signing instructions.</p>
              )}
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <span className="t-label text-foreground">Supporting Documents <span className="t-caption text-muted-foreground">(optional)</span></span>
                {docs.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-muted rounded-md px-3 py-2.5">
                    <FileText size={14} strokeWidth={1.75} className="text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="t-caption text-foreground truncate flex-1">{f.name}</span>
                    <button type="button" onClick={() => setDocs(p => p.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-danger-fg transition-colors" aria-label={`Remove ${f.name}`}>
                      <XCircle size={13} strokeWidth={1.75} />
                    </button>
                  </div>
                ))}
                <div role="button" tabIndex={0}
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={e => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
                  className="flex items-center justify-center gap-2 border border-dashed border-border rounded-lg py-3.5 cursor-pointer hover:border-cta hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta">
                  <Plus size={14} strokeWidth={2} className="text-muted-foreground" aria-hidden="true" />
                  <span className="t-body text-muted-foreground">Add document</span>
                  <span className="t-caption text-muted-foreground">(PDF, JPG, PNG)</span>
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="sr-only"
                  onChange={e => { if (e.target.files) setDocs(p => [...p, ...Array.from(e.target.files!)]); e.target.value = ""; }} />
              </div>
            </div>
          </Card>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button variant="primary" loading={submitting} disabled={!canSubmit}
          leftIcon={<ArrowUpFromLine size={15} strokeWidth={1.75} aria-hidden="true" />}
          onClick={handleSubmit}>
          Submit Withdrawal Request
        </Button>
      </ModalFooter>
    </Modal>
  );
}

/* ─── Withdrawal Detail Modal ────────────────────────────────────── */
function WithdrawalDetailModal({ withdrawal, onClose, onEdit }: {
  withdrawal: Withdrawal;
  onClose: () => void;
  onEdit?: (w: Withdrawal) => void;
}) {
  // Approval pipeline steps
  const PIPELINE = [
    {
      key: "submitted",
      label: "Submitted",
      role: "Maker",
      meta: { name: withdrawal.createdBy, date: withdrawal.requestedDate },
    },
    {
      key: "pending_checker",
      label: "Checker Review",
      role: "Checker",
      meta: withdrawal.approvals?.checker
        ? { name: withdrawal.approvals.checker.name, date: withdrawal.approvals.checker.date }
        : null,
    },
    {
      key: "pending_approver",
      label: "Approver",
      role: "Approver",
      meta: withdrawal.approvals?.approver
        ? { name: withdrawal.approvals.approver.name, date: withdrawal.approvals.approver.date }
        : null,
    },
    {
      key: "processing",
      label: "Processing",
      role: "System",
      meta: null,
    },
    {
      key: "disbursed",
      label: "Disbursed",
      role: "System",
      meta: null,
    },
  ];

  const stageOrder: Record<string, number> = {
    submitted: 0, pending_checker: 1, pending_approver: 2, processing: 3, disbursed: 4,
    needs_action: 1, failed: 3,
  };
  const currentIdx = stageOrder[withdrawal.stage] ?? 0;

  const showTimeline = ["pending_checker", "pending_approver", "processing", "disbursed"].includes(withdrawal.stage);

  return (
    <Modal open onClose={onClose} size="xl">
      <ModalHeader
        title={withdrawal.withdrawalId}
        description={`${withdrawal.accountName} · ${kes(withdrawal.requestedAmount)}`}
        adornment={<span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0"><ArrowUpFromLine size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" /></span>}
        actions={stageBadge(withdrawal.stage)}
        onClose={onClose}
      />
      <ModalBody flush>
        <div className="px-6 py-5 flex flex-col gap-5">
          {withdrawal.returnReason && (
                <Alert variant="warn" title="Returned — action required">{withdrawal.returnReason}</Alert>
              )}
              {withdrawal.failureReason && (
                <Alert variant="danger" title="Disbursement failed">{withdrawal.failureReason}</Alert>
              )}

              {/* Balance / amount hero */}
              <div className="grid grid-cols-3 gap-3.5">
                <div className="rounded-xl px-5 py-4 flex flex-col gap-1" style={{ background: "linear-gradient(135deg, #004E38 0%, #006B4F 60%, #005240 100%)" }}>
                  <span className="t-label text-white/60">Requested Amount</span>
                  <span className="t-heading text-white tabular-nums">{kes(withdrawal.requestedAmount)}</span>
                </div>
                <div className="rounded-xl px-5 py-4 flex flex-col gap-1" style={{ background: "linear-gradient(135deg, #0a4a7a 0%, #1565a8 55%, #0d5490 100%)" }}>
                  <span className="t-label text-white/60">Available Balance</span>
                  <span className="t-heading text-white tabular-nums">{kes(withdrawal.availableBalance)}</span>
                </div>
                <div className="rounded-xl px-5 py-4 flex flex-col gap-1" style={{ background: "linear-gradient(135deg, #8B6914 0%, #C7A034 55%, #A07C20 100%)" }}>
                  <span className="t-label text-white/60">Payment Mode</span>
                  <span className="t-body-med text-white">{withdrawal.paymentMethod === "bank" ? "Bank Transfer" : "Mobile Money"}</span>
                  <span className="t-caption text-white/60">{withdrawal.paymentDetails}</span>
                </div>
              </div>

              {/* Account details */}
              <Card>
                <CardHeader icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Account Details" />
                <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-5">
                  <Field label="Investment Account" value={withdrawal.investmentAccountNo} />
                  <Field label="Account Name"       value={withdrawal.accountName} />
                  <Field label="Account Number"     value={withdrawal.accountNumber} />
                  <Field label="Available Balance"  value={kes(withdrawal.availableBalance)} />
                  <Field label="Actual Balance"     value={kes(withdrawal.availableBalance + withdrawal.requestedAmount)} />
                  <Field label="Requested Amount"   value={kes(withdrawal.requestedAmount)} />
                  <Field label="Currency"           value={withdrawal.currency} />
                  <Field label="Payment Mode"       value={withdrawal.paymentMethod === "bank" ? "Bank Transfer" : "Mobile Money"} />
                </div>
              </Card>

              {/* Payment details */}
              <Card>
                <CardHeader icon={<CreditCard size={15} strokeWidth={2} aria-hidden="true" />} title="Payment Details" />
                <div className="px-5 py-5 grid grid-cols-3 gap-x-8 gap-y-5">
                  <Field label="Payment Method"  value={withdrawal.paymentMethod === "bank" ? "Bank Transfer" : "Mobile Money"} />
                  <Field label="Payment Details" value={withdrawal.paymentDetails} />
                  <Field label="Destination Account" value={withdrawal.accountNumber} />
                </div>
              </Card>

              {/* Signature verification */}
              <Card>
                <CardHeader icon={<FileText size={15} strokeWidth={2} aria-hidden="true" />} title="Signature Verification" />
                <div className="px-5 py-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="t-label text-muted-foreground">Signing Instructions</span>
                    <p className="t-body text-foreground bg-muted rounded-md px-4 py-3">{withdrawal.signingInstructions}</p>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-lg border border-border bg-muted/30">
                    <div className="w-8 h-8 rounded-lg bg-success-bg flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} strokeWidth={1.75} className="text-success-fg" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="t-body-semi">Signature verified</span>
                      <span className="t-caption text-muted-foreground">Customer signature matches records on file.</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Request info */}
              <Card>
                <CardHeader icon={<Info size={15} strokeWidth={2} aria-hidden="true" />} title="Request Information" />
                <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-5">
                  <Field label="Withdrawal ID"  value={withdrawal.withdrawalId} />
                  <Field label="Requested Date" value={withdrawal.requestedDate} />
                  <Field label="Created By"     value={withdrawal.createdBy} />
                  <div className="flex flex-col gap-0.5">
                    <span style={{ fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.04em", fontWeight: 500, color: "#A8A7A1" }}>Status</span>
                    <div className="mt-1">{stageBadge(withdrawal.stage)}</div>
                  </div>
                </div>
              </Card>

              {/* Callback details — disbursed only */}
              {withdrawal.stage === "disbursed" && withdrawal.callbackDetails && (
                <Card>
                  <CardHeader icon={<CheckCircle2 size={15} strokeWidth={2} aria-hidden="true" />} title="Callback Details" />
                  <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-5">
                    <Field label="Callback Number"      value={withdrawal.callbackDetails.callbackNumber} />
                    <Field label="Callback By"          value={withdrawal.callbackDetails.callbackBy} />
                    <Field label="Callback Date"        value={withdrawal.callbackDetails.callbackDate} />
                    <div className="col-span-4">
                      <Field label="Verification Notes" value={withdrawal.callbackDetails.verificationNotes} />
                    </div>
                  </div>
                </Card>
              )}

              {/* Approval pipeline timeline */}
              {showTimeline && (
                <Card>
                  <CardHeader icon={<Clock size={15} strokeWidth={2} aria-hidden="true" />} title="Approval Pipeline" />
                  <div className="px-5 py-5">
                    <div className="flex items-start gap-0">
                      {PIPELINE.map((step, i) => {
                        const done    = i < currentIdx;
                        const active  = i === currentIdx;
                        const future  = i > currentIdx;
                        return (
                          <div key={step.key} className="flex flex-col items-center flex-1">
                            <div className="flex items-center w-full">
                              <div className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : done || active ? "bg-cta" : "bg-border"}`} />
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${done ? "bg-cta border-cta" : active ? "bg-primary border-primary ring-4 ring-primary/20" : "bg-background border-border"}`}>
                                {done
                                  ? <CheckCircle2 size={14} strokeWidth={2.5} className="text-white" aria-hidden="true" />
                                  : active
                                    ? <Clock size={13} strokeWidth={2} className="text-white" aria-hidden="true" />
                                    : <span className="t-caption text-muted-foreground font-semibold">{i + 1}</span>}
                              </div>
                              <div className={`h-0.5 flex-1 ${i === PIPELINE.length - 1 ? "opacity-0" : done ? "bg-cta" : "bg-border"}`} />
                            </div>
                            <div className="flex flex-col items-center gap-0.5 mt-2 px-1 text-center">
                              <span className={`t-caption font-semibold ${active ? "text-primary" : done ? "text-cta" : "text-muted-foreground"}`}>
                                {step.label}
                              </span>
                              <span className="t-caption text-muted-foreground">{step.role}</span>
                              {done && step.meta && (
                                <>
                                  <span className="t-caption text-foreground font-medium mt-0.5">{step.meta.name}</span>
                                  <span className="t-caption text-muted-foreground">{step.meta.date}</span>
                                </>
                              )}
                              {active && <span className="t-label text-warn-fg mt-0.5">In progress</span>}
                              {done && !step.meta && <span className="t-label text-success-fg mt-0.5">Done</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              )}

        </div>
      </ModalBody>
      <ModalFooter className="justify-between">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        {withdrawal.stage === "needs_action" && onEdit && (
          <Button variant="primary"
            leftIcon={<FileEdit size={15} strokeWidth={1.75} aria-hidden="true" />}
            onClick={() => { onClose(); onEdit(withdrawal); }}>
            Edit & Resubmit
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

/* ─── Checker Detail Modal ───────────────────────────────────────── */
function CheckerDetailModal({ withdrawal, onClose, onApprove, onReturn }: {
  withdrawal: Withdrawal;
  onClose: () => void;
  onApprove: (w: Withdrawal, callbackData: { callbackNumber: string; notes: string; date: string; time: string; result: "success" | "failed" }, reviewComment: string) => void;
  onReturn: (w: Withdrawal, reason: string) => void;
}) {
  const account = getAccount(withdrawal.investmentAccountNo);
  const customer = account?.cifId ? getCustomer(account.cifId) : undefined;
  const signatureDoc = customer?.documents.find(d => d.label === "Signature Image");

  // Signature verification state — verdict is implicit in footer action (approve = match, return = mismatch)

  // Build callback number options from account's registered withdrawal methods
  const callbackOptions: string[] = [];
  if (account?.primaryWithdrawal?.method === "mobile") callbackOptions.push(account.primaryWithdrawal.phoneNumber);
  if (account?.secondaryWithdrawal?.method === "mobile") callbackOptions.push((account.secondaryWithdrawal as any).phoneNumber);
  // Also include bank-linked account holder numbers if none
  if (callbackOptions.length === 0) callbackOptions.push("+254700000000");

  // Callback state
  const [cbNumber, setCbNumber]       = useState(callbackOptions[0] ?? "");
  const [cbNotes, setCbNotes]         = useState("");
  const [cbDate, setCbDate]           = useState("");
  const [cbTime, setCbTime]           = useState("");
  const [cbResult, setCbResult]       = useState<"success" | "failed">("success");
  const [reviewComment, setReviewComment] = useState("");
  const [returning, setReturning]     = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [confirmingApprove, setConfirmingApprove] = useState(false);
  const [submitting, setSubmitting]   = useState(false);

  const isPendingChecker = withdrawal.stage === "pending_checker";

  const canApprove = isPendingChecker && cbNumber && cbNotes.trim() && cbDate && cbTime;

  function handleReturn() {
    if (!returnReason.trim()) return;
    onReturn(withdrawal, returnReason);
    onClose();
  }

  // Shared read-only sections identical to WithdrawalDetailModal
  const PIPELINE = [
    { key: "submitted",       label: "Submitted",      role: "Maker",    meta: { name: withdrawal.createdBy, date: withdrawal.requestedDate } },
    { key: "pending_checker", label: "Checker Review", role: "Checker",  meta: withdrawal.approvals?.checker ? { name: withdrawal.approvals.checker.name, date: withdrawal.approvals.checker.date } : null },
    { key: "pending_approver",label: "Approver",       role: "Approver", meta: withdrawal.approvals?.approver ? { name: withdrawal.approvals.approver.name, date: withdrawal.approvals.approver.date } : null },
    { key: "processing",      label: "Processing",     role: "System",   meta: null },
    { key: "disbursed",       label: "Disbursed",      role: "System",   meta: null },
  ];
  const stageOrder: Record<string, number> = { submitted: 0, pending_checker: 1, pending_approver: 2, processing: 3, disbursed: 4, needs_action: 1, failed: 3 };
  const currentIdx = stageOrder[withdrawal.stage] ?? 0;

  return (
    <Modal open onClose={onClose} size="xl" disableBackdropClose={isPendingChecker}>
      <ModalHeader
        title={withdrawal.withdrawalId}
        description={`${withdrawal.accountName} · ${kes(withdrawal.requestedAmount)}`}
        adornment={<span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0"><ArrowUpFromLine size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" /></span>}
        actions={stageBadge(withdrawal.stage)}
        onClose={onClose}
      />
      <ModalBody flush>
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Hero tiles */}
          <div className="grid grid-cols-3 gap-3.5">
            <div className="rounded-xl px-5 py-4 flex flex-col gap-1" style={{ background: "linear-gradient(135deg, #004E38 0%, #006B4F 60%, #005240 100%)" }}>
              <span className="t-label text-white/60">Requested Amount</span>
              <span className="t-heading text-white tabular-nums">{kes(withdrawal.requestedAmount)}</span>
            </div>
            <div className="rounded-xl px-5 py-4 flex flex-col gap-1" style={{ background: "linear-gradient(135deg, #0a4a7a 0%, #1565a8 55%, #0d5490 100%)" }}>
              <span className="t-label text-white/60">Available Balance</span>
              <span className="t-heading text-white tabular-nums">{kes(withdrawal.availableBalance)}</span>
            </div>
            <div className="rounded-xl px-5 py-4 flex flex-col gap-1" style={{ background: "linear-gradient(135deg, #8B6914 0%, #C7A034 55%, #A07C20 100%)" }}>
              <span className="t-label text-white/60">Payment Mode</span>
              <span className="t-body-med text-white">{withdrawal.paymentMethod === "bank" ? "Bank Transfer" : "Mobile Money"}</span>
              <span className="t-caption text-white/60">{withdrawal.paymentDetails}</span>
            </div>
          </div>

          {/* Account details */}
          <Card>
            <CardHeader icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Account Details" />
            <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-5">
              <Field label="Investment Account" value={withdrawal.investmentAccountNo} />
              <Field label="Account Name"       value={withdrawal.accountName} />
              <Field label="Account Number"     value={withdrawal.accountNumber} />
              <Field label="Available Balance"  value={kes(withdrawal.availableBalance)} />
              <Field label="Actual Balance"     value={kes(withdrawal.availableBalance + withdrawal.requestedAmount)} />
              <Field label="Requested Amount"   value={kes(withdrawal.requestedAmount)} />
              <Field label="Currency"           value={withdrawal.currency} />
              <Field label="Payment Mode"       value={withdrawal.paymentMethod === "bank" ? "Bank Transfer" : "Mobile Money"} />
            </div>
          </Card>

          {/* Payment details */}
          <Card>
            <CardHeader icon={<CreditCard size={15} strokeWidth={2} aria-hidden="true" />} title="Payment Details" />
            <div className="px-5 py-5 grid grid-cols-3 gap-x-8 gap-y-5">
              <Field label="Payment Method"      value={withdrawal.paymentMethod === "bank" ? "Bank Transfer" : "Mobile Money"} />
              <Field label="Payment Details"     value={withdrawal.paymentDetails} />
              <Field label="Destination Account" value={withdrawal.accountNumber} />
            </div>
          </Card>

          {/* Signature verification */}
          <Card>
            <CardHeader
              icon={<PenLine size={15} strokeWidth={2} aria-hidden="true" />}
              title="Signature Verification"
              action={isPendingChecker ? <Badge variant="warn">Requires Review</Badge> : undefined}
            />
            <div className="px-5 py-5 flex flex-col gap-5">

              {/* Signing instructions */}
              <div className="flex flex-col gap-1.5">
                <span className="t-label text-muted-foreground">Signing Instructions</span>
                <p className="t-body text-foreground bg-muted rounded-md px-4 py-3">{withdrawal.signingInstructions}</p>
              </div>

              {/* Side-by-side signatures */}
              <div className="grid grid-cols-2 gap-4">
                {/* Specimen (on-file) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="t-label text-foreground">Signature Specimen</span>
                    <Badge variant="info">On file</Badge>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/40 flex items-center justify-center overflow-hidden" style={{ minHeight: 160 }}>
                    {signatureDoc?.fileName ? (
                      /* In a real app this would be an <img src={signatureDoc.url} /> */
                      <div className="flex flex-col items-center gap-3 py-8 px-6 w-full">
                        <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center">
                          <PenLine size={20} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />
                        </div>
                        <span className="t-body-semi text-foreground">{signatureDoc.fileName}</span>
                        <span className="t-caption text-muted-foreground">Uploaded {signatureDoc.date}</span>
                        <button
                          type="button"
                          className="t-sm text-cta hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta rounded"
                        >
                          View file
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-8 text-center px-6">
                        <PenLine size={20} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />
                        <span className="t-body text-muted-foreground">No specimen on file</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Uploaded (from withdrawal request) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="t-label text-foreground">Uploaded Signature</span>
                    <Badge variant="warn">From request</Badge>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/40 flex items-center justify-center overflow-hidden" style={{ minHeight: 160 }}>
                    {/* In production this comes from the withdrawal's supporting documents */}
                    <div className="flex flex-col items-center gap-3 py-8 px-6 w-full">
                      <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center">
                        <Upload size={20} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />
                      </div>
                      <span className="t-body-semi text-foreground">withdrawal_signature.png</span>
                      <span className="t-caption text-muted-foreground">Submitted {withdrawal.requestedDate}</span>
                      <button
                        type="button"
                        className="t-sm text-cta hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta rounded"
                      >
                        View file
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guidance note */}
              {isPendingChecker && (
                <p className="t-sm text-muted-foreground">
                  Compare the two signatures before making your decision below.
                </p>
              )}
            </div>
          </Card>

          {/* ── Call Back Required ── */}
          <Card>
            <CardHeader
              icon={<Smartphone size={15} strokeWidth={2} aria-hidden="true" />}
              title="Call Back Required"
              action={<Badge variant="warn">Required</Badge>}
            />
            <div className="px-5 py-5 flex flex-col gap-4">
              <Alert variant="warn">This withdrawal requires customer callback verification before approval.</Alert>

              {/* Callback number */}
              <div className="flex flex-col gap-1.5">
                <label className="t-label text-foreground" htmlFor="cb-number">Select Callback Number <span className="text-danger-fg">*</span></label>
                <select
                  id="cb-number"
                  value={cbNumber}
                  onChange={e => setCbNumber(e.target.value)}
                  disabled={!isPendingChecker}
                  className="h-10 rounded-md border border-border bg-background px-3.5 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {callbackOptions.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                  <option value="__other">Other…</option>
                </select>
                {cbNumber === "__other" && (
                  <Input
                    placeholder="Enter phone number"
                    value=""
                    onChange={e => setCbNumber(e.target.value)}
                    leftSlot={<Smartphone size={14} strokeWidth={1.75} aria-hidden="true" />}
                  />
                )}
              </div>

              {/* Callback verification notes */}
              <div className="flex flex-col gap-1.5">
                <label className="t-label text-foreground" htmlFor="cb-notes">Callback Verification Notes <span className="text-danger-fg">*</span></label>
                <textarea
                  id="cb-notes"
                  value={cbNotes}
                  onChange={e => setCbNotes(e.target.value)}
                  disabled={!isPendingChecker}
                  placeholder="Describe what was verified during the call…"
                  rows={3}
                  className="rounded-md border border-border bg-background px-3.5 py-2.5 t-body text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Callback Date *"
                  type="date"
                  value={cbDate}
                  onChange={e => setCbDate(e.target.value)}
                  disabled={!isPendingChecker}
                />
                <Input
                  label="Callback Time *"
                  type="time"
                  value={cbTime}
                  onChange={e => setCbTime(e.target.value)}
                  disabled={!isPendingChecker}
                />
              </div>

              {/* Callback result radio */}
              <div className="flex items-center gap-6 pt-1" role="radiogroup" aria-label="Callback result">
                {(["success", "failed"] as const).map(val => (
                  <label key={val} className={`flex items-center gap-2.5 cursor-pointer ${!isPendingChecker ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <input
                      type="radio"
                      name="cb-result"
                      value={val}
                      checked={cbResult === val}
                      onChange={() => isPendingChecker && setCbResult(val)}
                      disabled={!isPendingChecker}
                      className="w-4 h-4 accent-cta"
                    />
                    <span className="t-body">{val === "success" ? "Callback Successful" : "Callback Failed"}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          {/* ── Review Comment ── */}
          <Card>
            <CardHeader icon={<FileEdit size={15} strokeWidth={2} aria-hidden="true" />} title="Review Comment" />
            <div className="px-5 py-5">
              <div className="flex flex-col gap-1.5">
                <label className="t-label text-foreground" htmlFor="review-comment">
                  Checker Comment <span className="t-caption text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  disabled={!isPendingChecker}
                  placeholder="Add any notes or observations for the approver…"
                  rows={3}
                  className="rounded-md border border-border bg-background px-3.5 py-2.5 t-body text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </Card>

          {/* Request info */}
          <Card>
            <CardHeader icon={<Info size={15} strokeWidth={2} aria-hidden="true" />} title="Request Information" />
            <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-5">
              <Field label="Withdrawal ID"  value={withdrawal.withdrawalId} />
              <Field label="Requested Date" value={withdrawal.requestedDate} />
              <Field label="Created By"     value={withdrawal.createdBy} />
              <div className="flex flex-col gap-0.5">
                <span style={{ fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.04em", fontWeight: 500, color: "#A8A7A1" }}>Status</span>
                <div className="mt-1">{stageBadge(withdrawal.stage)}</div>
              </div>
            </div>
          </Card>

          {/* Approval pipeline */}
          <Card>
            <CardHeader icon={<Clock size={15} strokeWidth={2} aria-hidden="true" />} title="Approval Pipeline" />
            <div className="px-5 py-5">
              <div className="flex items-start gap-0">
                {PIPELINE.map((step, i) => {
                  const done   = i < currentIdx;
                  const active = i === currentIdx;
                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div className="flex items-center w-full">
                        <div className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : done || active ? "bg-cta" : "bg-border"}`} />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${done ? "bg-cta border-cta" : active ? "bg-primary border-primary ring-4 ring-primary/20" : "bg-background border-border"}`}>
                          {done ? <CheckCircle2 size={14} strokeWidth={2.5} className="text-white" aria-hidden="true" />
                            : active ? <Clock size={13} strokeWidth={2} className="text-white" aria-hidden="true" />
                            : <span className="t-caption text-muted-foreground font-semibold">{i + 1}</span>}
                        </div>
                        <div className={`h-0.5 flex-1 ${i === PIPELINE.length - 1 ? "opacity-0" : done ? "bg-cta" : "bg-border"}`} />
                      </div>
                      <div className="flex flex-col items-center gap-0.5 mt-2 px-1 text-center">
                        <span className={`t-caption font-semibold ${active ? "text-primary" : done ? "text-cta" : "text-muted-foreground"}`}>{step.label}</span>
                        <span className="t-caption text-muted-foreground">{step.role}</span>
                        {done && step.meta && (<><span className="t-caption text-foreground font-medium mt-0.5">{step.meta.name}</span><span className="t-caption text-muted-foreground">{step.meta.date}</span></>)}
                        {active && <span className="t-label text-warn-fg mt-0.5">In progress</span>}
                        {done && !step.meta && <span className="t-label text-success-fg mt-0.5">Done</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

        </div>
      </ModalBody>

      {/* Footer — only interactive when pending checker review */}
      {isPendingChecker ? (
        <ModalFooter className="justify-between">
          <Button variant="danger"
            leftIcon={<CornerUpLeft size={15} strokeWidth={1.75} aria-hidden="true" />}
            onClick={() => setReturning(true)}>
            Return to Maker
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button variant="primary" disabled={!canApprove}
              leftIcon={<ThumbsUp size={15} strokeWidth={1.75} aria-hidden="true" />}
              onClick={() => setConfirmingApprove(true)}>
              Approve & Forward
            </Button>
          </div>
        </ModalFooter>
      ) : (
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </ModalFooter>
      )}

      {/* Approve confirmation modal */}
      {confirmingApprove && (
        <Modal open onClose={() => setConfirmingApprove(false)} size="md" disableBackdropClose>
          <ModalHeader
            title="Confirm Approval"
            description="Please review the summary before forwarding to the approver."
            adornment={<span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0"><ThumbsUp size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" /></span>}
            onClose={() => setConfirmingApprove(false)}
          />
          <ModalBody>
            <div className="px-6 py-5 flex flex-col gap-4">
              <Alert variant="info">
                Once forwarded, this withdrawal will be queued for approver review. This action cannot be undone.
              </Alert>

              {/* Summary */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-4 py-3 bg-muted border-b border-border">
                  <span className="t-label text-muted-foreground">Withdrawal Summary</span>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { label: "Withdrawal ID",     value: withdrawal.withdrawalId },
                    { label: "Account Name",       value: withdrawal.accountName },
                    { label: "Investment Account", value: withdrawal.investmentAccountNo },
                    { label: "Amount",             value: kes(withdrawal.requestedAmount) },
                    { label: "Payment Method",     value: withdrawal.paymentMethod === "bank" ? "Bank Transfer" : "Mobile Money" },
                    { label: "Payment Destination",value: withdrawal.paymentDetails },
                    { label: "Callback Number",    value: cbNumber },
                    { label: "Callback Result",    value: cbResult === "success" ? "Successful" : "Failed" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-2.5 gap-4">
                      <span className="t-sm text-muted-foreground shrink-0">{row.label}</span>
                      <span className="t-body-med text-foreground text-right">{row.value}</span>
                    </div>
                  ))}
                  {reviewComment.trim() && (
                    <div className="flex flex-col gap-1 px-4 py-2.5">
                      <span className="t-sm text-muted-foreground">Checker Comment</span>
                      <span className="t-body text-foreground">{reviewComment}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setConfirmingApprove(false)} disabled={submitting}>Cancel</Button>
            <Button variant="primary" loading={submitting}
              leftIcon={<ThumbsUp size={15} strokeWidth={1.75} aria-hidden="true" />}
              onClick={() => {
                setSubmitting(true);
                setTimeout(() => {
                  setSubmitting(false);
                  onApprove(withdrawal, { callbackNumber: cbNumber, notes: cbNotes, date: cbDate, time: cbTime, result: cbResult }, reviewComment);
                  setConfirmingApprove(false);
                  onClose();
                }, 700);
              }}>
              Confirm & Forward to Approver
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Return-to-maker inline modal */}
      {returning && (
        <Modal open onClose={() => setReturning(false)} size="md" disableBackdropClose>
          <ModalHeader
            title="Return to Maker"
            description={`${withdrawal.withdrawalId} · ${withdrawal.accountName}`}
            adornment={<span className="w-10 h-10 rounded-xl bg-danger-bg flex items-center justify-center shrink-0"><CornerUpLeft size={18} strokeWidth={1.75} className="text-danger-fg" aria-hidden="true" /></span>}
            onClose={() => setReturning(false)}
          />
          <ModalBody>
            <div className="px-6 py-5 flex flex-col gap-4">
              <Alert variant="warn">The withdrawal will be returned to the maker. They will need to edit and resubmit.</Alert>
              <Input
                label="Return Reason *"
                value={returnReason}
                onChange={e => setReturnReason(e.target.value)}
                placeholder="Describe the issue the maker needs to fix…"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setReturning(false)}>Cancel</Button>
            <Button variant="danger" disabled={!returnReason.trim()}
              leftIcon={<CornerUpLeft size={15} strokeWidth={1.75} aria-hidden="true" />}
              onClick={handleReturn}>
              Return to Maker
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Modal>
  );
}

/* ─── Main screen ────────────────────────────────────────────────── */
type MainTab = "needs_action" | "in_progress" | "disbursed" | "failed";
type CheckerTab = "pending_review" | "reviewed" | "disbursed";
type InProgressFilter = "all" | "pending_checker" | "pending_approver" | "processing";
const TABLE_COLS = "2fr 1.2fr 1.2fr 1fr 1fr 48px";

const DISBURSEMENT_ACCOUNT = { no: "DISB-COLL-001", name: "CISL Disbursement Account" };
const LOW_BALANCE_THRESHOLD = 5000000; // 5M KES

/* ─── Main screen ────────────────────────────────────────────────── */
export function Withdrawals() {
  const toast = useToast();
  const { role } = useRole();
  const isChecker = role === "checker" || role === "admin";

  const [withdrawalList, setWithdrawalList] = useState<Withdrawal[]>(initialWithdrawals);
  const [activeTab, setActiveTab]           = useState<MainTab>("needs_action");
  const [checkerTab, setCheckerTab]         = useState<CheckerTab>("pending_review");
  const [checkerReturning, setCheckerReturning] = useState<Withdrawal | null>(null);
  const [checkerReturnReason, setCheckerReturnReason] = useState("");
  const [disbBalance, setDisbBalance]   = useState(12450000);
  const [refreshing, setRefreshing]     = useState(false);
  const [inProgressFilter, setInProgressFilter] = useState<InProgressFilter>("all");
  const [showForm, setShowForm]             = useState(false);
  const [editing, setEditing]               = useState<Withdrawal | null>(null);
  const [viewing, setViewing]               = useState<Withdrawal | null>(null);
  const [checkerViewing, setCheckerViewing] = useState<Withdrawal | null>(null);

  const needsAction  = withdrawalList.filter(w => w.stage === "needs_action");
  const inProgress   = withdrawalList.filter(w => ["pending_checker", "pending_approver", "processing"].includes(w.stage));
  const disbursed    = withdrawalList.filter(w => w.stage === "disbursed");
  const failed       = withdrawalList.filter(w => w.stage === "failed");

  const inProgressFiltered = inProgressFilter === "all" ? inProgress
    : inProgress.filter(w => w.stage === inProgressFilter);

  const tabCounts: Record<MainTab, number> = {
    needs_action: needsAction.length,
    in_progress:  inProgress.length,
    disbursed:    disbursed.length,
    failed:       failed.length,
  };

  const TABS: { key: MainTab; label: string }[] = [
    { key: "needs_action", label: "Needs My Action" },
    { key: "in_progress",  label: "In Progress" },
    { key: "disbursed",    label: "Disbursed" },
    { key: "failed",       label: "Failed" },
  ];

  function handleSubmit(data: Partial<Withdrawal>) {
    const newId = `WD-2026-${String(withdrawalList.length + 1).padStart(3, "0")}`;
    const newW: Withdrawal = {
      withdrawalId: newId,
      investmentAccountNo: data.investmentAccountNo ?? "",
      accountName: data.accountName ?? "",
      accountNumber: data.accountNumber ?? "",
      availableBalance: data.availableBalance ?? 0,
      requestedAmount: data.requestedAmount ?? 0,
      currency: "KES",
      paymentMethod: data.paymentMethod ?? "bank",
      paymentDetails: data.paymentDetails ?? "",
      stage: "pending_checker",
      createdBy: "John Mwangi",
      requestedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      requestedTime: new Date().toISOString(),
      signingInstructions: data.signingInstructions ?? "",
      auditTrail: [{ time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), action: "Withdrawal request submitted", user: "John Mwangi" }],
    };
    if (editing) {
      setWithdrawalList(prev => prev.map(w => w.withdrawalId === editing.withdrawalId
        ? { ...newW, withdrawalId: editing.withdrawalId }
        : w));
      toast({ variant: "success", title: "Resubmitted", description: `${editing.withdrawalId} resubmitted for checker review.` });
      setEditing(null);
    } else {
      setWithdrawalList(prev => [newW, ...prev]);
      toast({ variant: "success", title: "Request submitted", description: `${newId} submitted for checker review.` });
    }
    setActiveTab("in_progress");
  }

  function handleRetry(w: Withdrawal) {
    setEditing(w);
    setShowForm(true);
  }

  function handleRefreshBalance() {
    setRefreshing(true);
    setTimeout(() => {
      // Simulate refreshed balance
      setDisbBalance(prev => prev - Math.floor(Math.random() * 100000));
      setRefreshing(false);
      toast({ variant: "success", title: "Balance refreshed", description: "Disbursement account balance is up to date." });
    }, 1000);
  }

  const isLowBalance = disbBalance < LOW_BALANCE_THRESHOLD;

  /* Table row renderer */
  function TableRow({ w, actions }: { w: Withdrawal; actions: React.ReactNode }) {
    return (
      <TableGridRow cols={TABLE_COLS}>
        <div className="flex flex-col gap-0.5 min-w-0 pr-3">
          <button onClick={() => setViewing(w)} className="t-body-semi text-cta hover:underline text-left truncate">{w.withdrawalId}</button>
          <span className="t-caption text-muted-foreground">{w.accountName} · {w.investmentAccountNo}</span>
        </div>
        <Td><span className="t-body tabular-nums">{kes(w.availableBalance)}</span></Td>
        <Td><span className="t-body-med tabular-nums">{kes(w.requestedAmount)}</span></Td>
        <Td muted>{w.createdBy}</Td>
        <Td muted>{w.requestedDate}</Td>
        <Td>{actions}</Td>
      </TableGridRow>
    );
  }

  return (
    <>
      <TopBar crumbs={[{ label: "Transactions" }, { label: "Withdrawals" }]} />
      <PageShell>
        <PageHeader title="Withdrawals" meta="Manage client withdrawal requests"
          action={
            !isChecker ? (
              <Button variant="primary" size="md"
                leftIcon={<Plus size={15} strokeWidth={1.75} aria-hidden="true" />}
                onClick={() => { setEditing(null); setShowForm(true); }}>
                New Withdrawal
              </Button>
            ) : undefined
          }
        />

        {/* Disbursement account balance card */}
        <div className={`rounded-xl overflow-hidden mb-5 border ${isLowBalance ? "border-warn-fg/30" : "border-border"}`}>
          <div className="px-5 py-4 flex items-center gap-6" style={{ background: isLowBalance ? "linear-gradient(135deg, #6B4B08 0%, #8A6D12 60%, #705A0A 100%)" : "linear-gradient(135deg, #004E38 0%, #006B4F 60%, #005240 100%)" }}>
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 60%)" }} />
            <div className="flex flex-col gap-0.5 flex-1 relative z-10">
              <span className="t-label text-white/60 tracking-widest">DISBURSEMENT ACCOUNT</span>
              <span className="t-caption text-white/50">{DISBURSEMENT_ACCOUNT.no} · {DISBURSEMENT_ACCOUNT.name}</span>
            </div>
            <div className="flex flex-col items-end gap-0.5 relative z-10">
              <span className="t-label text-white/60">Available Balance</span>
              <span className="t-heading text-white tabular-nums">{kes(disbBalance)}</span>
            </div>
            {isLowBalance && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/20 relative z-10 shrink-0">
                <AlertCircle size={14} strokeWidth={1.75} className="text-white/80" aria-hidden="true" />
                <span className="t-caption text-white/80">Low balance</span>
              </div>
            )}
            <button type="button" onClick={handleRefreshBalance}
              className="relative z-10 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors shrink-0"
              aria-label="Refresh balance">
              <RefreshCw size={14} strokeWidth={1.75} className={refreshing ? "animate-spin" : ""} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            CHECKER VIEW
        ══════════════════════════════════════════ */}
        {isChecker && (() => {
          const pendingReview = withdrawalList.filter(w => w.stage === "pending_checker");
          const reviewed      = withdrawalList.filter(w => ["pending_approver", "processing"].includes(w.stage));
          const checkerDisb   = withdrawalList.filter(w => w.stage === "disbursed");

          const CHECKER_TABS: { key: CheckerTab; label: string; count: number }[] = [
            { key: "pending_review", label: "Pending Review",  count: pendingReview.length },
            { key: "reviewed",       label: "Reviewed",        count: reviewed.length },
            { key: "disbursed",      label: "Disbursed",       count: checkerDisb.length },
          ];

          function handleCheckerApprove(
            w: Withdrawal,
            cb: { callbackNumber: string; notes: string; date: string; time: string; result: "success" | "failed" },
            comment: string,
          ) {
            const dateStr = cb.date
              ? new Date(cb.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
              : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
            setWithdrawalList(prev => prev.map(x =>
              x.withdrawalId === w.withdrawalId
                ? {
                    ...x,
                    stage: "pending_approver" as const,
                    approvals: { ...x.approvals, checker: { name: "Checker (you)", date: dateStr } },
                    callbackDetails: {
                      callbackNumber: cb.callbackNumber,
                      verificationNotes: cb.notes + (comment ? `\n\nChecker comment: ${comment}` : ""),
                      callbackBy: "Checker (you)",
                      callbackDate: `${dateStr}, ${cb.time}`,
                    },
                  }
                : x,
            ));
            toast({ variant: "success", title: "Cleared for approval", description: `${w.withdrawalId} sent to approver.` });
          }

          function handleCheckerReturn(w: Withdrawal, reason: string) {
            setWithdrawalList(prev => prev.map(x =>
              x.withdrawalId === w.withdrawalId
                ? { ...x, stage: "needs_action" as const, returnReason: reason }
                : x,
            ));
            toast({ variant: "warn", title: "Returned to maker", description: `${w.withdrawalId} returned for correction.` });
          }

          const CHECKER_TABLE_COLS = "2fr 1.2fr 1.2fr 1fr 1fr 48px";

          return (
            <>
              {/* Checker sub-tabs */}
              <div role="tablist" className="flex gap-6 border-b border-border mb-5">
                {CHECKER_TABS.map(t => (
                  <button key={t.key} role="tab" aria-selected={checkerTab === t.key}
                    onClick={() => setCheckerTab(t.key)}
                    className={["flex items-center gap-2 py-2.5 -mb-px t-body border-b-2 transition-colors whitespace-nowrap",
                      checkerTab === t.key ? "border-cta text-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"].join(" ")}>
                    {t.label}
                    <span className="t-caption text-muted-foreground bg-panel rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{t.count}</span>
                  </button>
                ))}
              </div>

              {/* ── CHECKER: PENDING REVIEW ── */}
              {checkerTab === "pending_review" && (
                <div className="flex flex-col gap-4">
                  {pendingReview.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center"><CheckCircle2 size={24} strokeWidth={1.5} className="text-cta" aria-hidden="true" /></div>
                      <p className="t-body-semi">Queue is empty</p>
                      <p className="t-body text-muted-foreground">No withdrawals pending checker review.</p>
                    </div>
                  ) : (
                    <>
                      <Alert variant="info">Click a withdrawal to open the review panel — complete the callback verification, add a comment, then approve or return to maker.</Alert>
                      <TableGrid>
                        <TableHead>
                          <TableGridRow cols={CHECKER_TABLE_COLS} head>
                            <Th>Account Details</Th>
                            <Th>Available Balance</Th>
                            <Th>Requested Amount</Th>
                            <Th>Created By</Th>
                            <Th>Requested Date</Th>
                            <Th />
                          </TableGridRow>
                        </TableHead>
                        <TableBody>
                          {pendingReview.map(w => (
                            <TableGridRow key={w.withdrawalId} cols={CHECKER_TABLE_COLS}>
                              <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                                <button onClick={() => setCheckerViewing(w)} className="t-body-semi text-cta hover:underline text-left truncate">{w.withdrawalId}</button>
                                <span className="t-caption text-muted-foreground">{w.accountName} · {w.investmentAccountNo}</span>
                              </div>
                              <Td><span className="t-body tabular-nums">{kes(w.availableBalance)}</span></Td>
                              <Td><span className="t-body-med tabular-nums">{kes(w.requestedAmount)}</span></Td>
                              <Td muted>{w.createdBy}</Td>
                              <Td muted>{w.requestedDate}</Td>
                              <Td>
                                <RowMenu items={[
                                  { label: "Review", icon: <Eye size={14} strokeWidth={1.75} />, onClick: () => setCheckerViewing(w) },
                                ]} />
                              </Td>
                            </TableGridRow>
                          ))}
                        </TableBody>
                      </TableGrid>
                      <span className="t-body text-muted-foreground">{pendingReview.length} pending</span>
                    </>
                  )}
                </div>
              )}

              {/* ── CHECKER: REVIEWED ── */}
              {checkerTab === "reviewed" && (
                <div className="flex flex-col gap-4">
                  <TableGrid>
                    <TableHead>
                      <TableGridRow cols="2fr 1.2fr 1.2fr 1fr 1fr 120px 48px" head>
                        <Th>Account Details</Th>
                        <Th>Available Balance</Th>
                        <Th>Requested Amount</Th>
                        <Th>Created By</Th>
                        <Th>Requested Date</Th>
                        <Th>Status</Th>
                        <Th />
                      </TableGridRow>
                    </TableHead>
                    <TableBody>
                      {reviewed.length === 0 && <TableEmpty>No reviewed withdrawals yet.</TableEmpty>}
                      {reviewed.map(w => (
                        <TableGridRow key={w.withdrawalId} cols="2fr 1.2fr 1.2fr 1fr 1fr 120px 48px">
                          <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                            <button onClick={() => setCheckerViewing(w)} className="t-body-semi text-cta hover:underline text-left truncate">{w.withdrawalId}</button>
                            <span className="t-caption text-muted-foreground">{w.accountName} · {w.investmentAccountNo}</span>
                          </div>
                          <Td><span className="t-body tabular-nums">{kes(w.availableBalance)}</span></Td>
                          <Td><span className="t-body-med tabular-nums">{kes(w.requestedAmount)}</span></Td>
                          <Td muted>{w.createdBy}</Td>
                          <Td muted>{w.requestedDate}</Td>
                          <Td>{stageBadge(w.stage)}</Td>
                          <Td><RowMenu items={[{ label: "View", icon: <Eye size={14} strokeWidth={1.75} />, onClick: () => setCheckerViewing(w) }]} /></Td>
                        </TableGridRow>
                      ))}
                    </TableBody>
                  </TableGrid>
                  {reviewed.length > 0 && <span className="t-body text-muted-foreground">{reviewed.length} reviewed</span>}
                </div>
              )}

              {/* ── CHECKER: DISBURSED ── */}
              {checkerTab === "disbursed" && (
                <div className="flex flex-col gap-4">
                  <TableGrid>
                    <TableHead>
                      <TableGridRow cols={CHECKER_TABLE_COLS} head>
                        <Th>Account Details</Th>
                        <Th>Available Balance</Th>
                        <Th>Requested Amount</Th>
                        <Th>Created By</Th>
                        <Th>Requested Date</Th>
                        <Th />
                      </TableGridRow>
                    </TableHead>
                    <TableBody>
                      {checkerDisb.length === 0 && <TableEmpty>No disbursed withdrawals.</TableEmpty>}
                      {checkerDisb.map(w => (
                        <TableGridRow key={w.withdrawalId} cols={CHECKER_TABLE_COLS}>
                          <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                            <button onClick={() => setCheckerViewing(w)} className="t-body-semi text-cta hover:underline text-left truncate">{w.withdrawalId}</button>
                            <span className="t-caption text-muted-foreground">{w.accountName} · {w.investmentAccountNo}</span>
                          </div>
                          <Td><span className="t-body tabular-nums">{kes(w.availableBalance)}</span></Td>
                          <Td><span className="t-body-med tabular-nums">{kes(w.requestedAmount)}</span></Td>
                          <Td muted>{w.createdBy}</Td>
                          <Td muted>{w.requestedDate}</Td>
                          <Td><RowMenu items={[{ label: "View", icon: <Eye size={14} strokeWidth={1.75} />, onClick: () => setCheckerViewing(w) }]} /></Td>
                        </TableGridRow>
                      ))}
                    </TableBody>
                  </TableGrid>
                  {checkerDisb.length > 0 && <span className="t-body text-muted-foreground">{checkerDisb.length} disbursed</span>}
                </div>
              )}

              {/* Checker detail modal */}
              {checkerViewing && (
                <CheckerDetailModal
                  withdrawal={checkerViewing}
                  onClose={() => setCheckerViewing(null)}
                  onApprove={(w, cb, comment) => { handleCheckerApprove(w, cb, comment); setCheckerViewing(null); }}
                  onReturn={(w, reason) => { handleCheckerReturn(w, reason); setCheckerViewing(null); }}
                />
              )}
            </>
          );
        })()}

        {/* ══════════════════════════════════════════
            MAKER VIEW
        ══════════════════════════════════════════ */}
        {!isChecker && (
          <>
            {/* Tabs */}
            <div role="tablist" className="flex gap-6 border-b border-border mb-5">
          {TABS.map(t => (
            <button key={t.key} role="tab" aria-selected={activeTab === t.key}
              onClick={() => setActiveTab(t.key)}
              className={["flex items-center gap-2 py-2.5 -mb-px t-body border-b-2 transition-colors whitespace-nowrap",
                activeTab === t.key ? "border-cta text-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"].join(" ")}>
              {t.label}
              <span className="t-caption text-muted-foreground bg-panel rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{tabCounts[t.key]}</span>
            </button>
          ))}
        </div>

        {/* ── NEEDS MY ACTION ── */}
        {activeTab === "needs_action" && (
          <div className="flex flex-col gap-4">
            {needsAction.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center"><CheckCircle2 size={24} strokeWidth={1.5} className="text-cta" aria-hidden="true" /></div>
                <p className="t-body-semi">All clear</p>
                <p className="t-body text-muted-foreground">No withdrawals need your attention right now.</p>
              </div>
            ) : (
              <>
                <Alert variant="warn">These withdrawals were returned by a checker or approver. Review the reason and edit & resubmit to proceed.</Alert>
                <TableGrid>
                  <TableHead>
                    <TableGridRow cols="2fr 1.2fr 1.2fr 1fr 1fr 2fr 48px" head>
                      <Th>Account Details</Th>
                      <Th>Available Balance</Th>
                      <Th>Requested Amount</Th>
                      <Th>Created By</Th>
                      <Th>Requested Date</Th>
                      <Th>Return Reason</Th>
                      <Th />
                    </TableGridRow>
                  </TableHead>
                  <TableBody>
                    {needsAction.map(w => (
                      <TableGridRow key={w.withdrawalId} cols="2fr 1.2fr 1.2fr 1fr 1fr 2fr 48px">
                        <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                          <button onClick={() => setViewing(w)} className="t-body-semi text-cta hover:underline text-left truncate">{w.withdrawalId}</button>
                          <span className="t-caption text-muted-foreground">{w.accountName} · {w.investmentAccountNo}</span>
                        </div>
                        <Td><span className="t-body tabular-nums">{kes(w.availableBalance)}</span></Td>
                        <Td><span className="t-body-med tabular-nums">{kes(w.requestedAmount)}</span></Td>
                        <Td muted>{w.createdBy}</Td>
                        <Td muted>{w.requestedDate}</Td>
                        <Td>
                          <div className="flex flex-col gap-1">
                            <Badge variant="danger">Returned</Badge>
                            <span className="t-caption text-muted-foreground line-clamp-2">{w.returnReason}</span>
                          </div>
                        </Td>
                        <Td>
                          <RowMenu items={[
                            { label: "View", icon: <Eye size={14} strokeWidth={1.75} />, onClick: () => setViewing(w) },
                            { label: "Edit & Resubmit", icon: <FileEdit size={14} strokeWidth={1.75} />, onClick: () => { setEditing(w); setShowForm(true); } },
                          ]} />
                        </Td>
                      </TableGridRow>
                    ))}
                  </TableBody>
                </TableGrid>
              </>
            )}
          </div>
        )}

        {/* ── IN PROGRESS ── */}
        {activeTab === "in_progress" && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
              {([
                { key: "all",              label: "All" },
                { key: "pending_checker",  label: "Pending Checker" },
                { key: "pending_approver", label: "Pending Approvers" },
                { key: "processing",       label: "Processing" },
              ] as const).map(f => (
                <button key={f.key} type="button" onClick={() => setInProgressFilter(f.key)}
                  className={`px-3 py-1.5 rounded-md t-body transition-colors whitespace-nowrap ${inProgressFilter === f.key ? "bg-card text-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <TableGrid>
              <TableHead>
                <TableGridRow cols="2fr 1.2fr 1.2fr 1fr 1fr 120px 48px" head>
                  <Th>Account Details</Th><Th>Available Balance</Th><Th>Requested Amount</Th>
                  <Th>Created By</Th><Th>Requested Date</Th><Th>Status</Th><Th />
                </TableGridRow>
              </TableHead>
              <TableBody>
                {inProgressFiltered.length === 0 && <TableEmpty>No withdrawals in this stage.</TableEmpty>}
                {inProgressFiltered.map(w => (
                  <TableGridRow key={w.withdrawalId} cols="2fr 1.2fr 1.2fr 1fr 1fr 120px 48px">
                    <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                      <button onClick={() => setViewing(w)} className="t-body-semi text-cta hover:underline text-left truncate">{w.withdrawalId}</button>
                      <span className="t-caption text-muted-foreground">{w.accountName} · {w.investmentAccountNo}</span>
                    </div>
                    <Td><span className="t-body tabular-nums">{kes(w.availableBalance)}</span></Td>
                    <Td><span className="t-body-med tabular-nums">{kes(w.requestedAmount)}</span></Td>
                    <Td muted>{w.createdBy}</Td>
                    <Td muted>{w.requestedDate}</Td>
                    <Td>{stageBadge(w.stage)}</Td>
                    <Td><RowMenu items={[{ label: "View", icon: <Eye size={14} strokeWidth={1.75} />, onClick: () => setViewing(w) }]} /></Td>
                  </TableGridRow>
                ))}
              </TableBody>
            </TableGrid>
            <span className="t-body text-muted-foreground">{inProgressFiltered.length} withdrawal{inProgressFiltered.length !== 1 ? "s" : ""}</span>
          </div>
        )}

        {/* ── DISBURSED ── */}
        {activeTab === "disbursed" && (
          <div className="flex flex-col gap-4">
            <TableGrid>
              <TableHead>
                <TableGridRow cols={TABLE_COLS} head>
                  <Th>Account Details</Th><Th>Available Balance</Th><Th>Requested Amount</Th>
                  <Th>Created By</Th><Th>Requested Date</Th><Th />
                </TableGridRow>
              </TableHead>
              <TableBody>
                {disbursed.length === 0 && <TableEmpty>No disbursed withdrawals.</TableEmpty>}
                {disbursed.map(w => (
                  <TableRow key={w.withdrawalId} w={w} actions={
                    <RowMenu items={[{ label: "View", icon: <Eye size={14} strokeWidth={1.75} />, onClick: () => setViewing(w) }]} />
                  } />
                ))}
              </TableBody>
            </TableGrid>
            <span className="t-body text-muted-foreground">{disbursed.length} disbursed</span>
          </div>
        )}

        {/* ── FAILED ── */}
        {activeTab === "failed" && (
          <div className="flex flex-col gap-4">
            <TableGrid>
              <TableHead>
                <TableGridRow cols="2fr 1.2fr 1.2fr 1fr 1fr 2fr 48px" head>
                  <Th>Account Details</Th><Th>Available Balance</Th><Th>Requested Amount</Th>
                  <Th>Created By</Th><Th>Requested Date</Th><Th>Failure Reason</Th><Th />
                </TableGridRow>
              </TableHead>
              <TableBody>
                {failed.length === 0 && <TableEmpty>No failed withdrawals.</TableEmpty>}
                {failed.map(w => (
                  <TableGridRow key={w.withdrawalId} cols="2fr 1.2fr 1.2fr 1fr 1fr 2fr 48px">
                    <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                      <button onClick={() => setViewing(w)} className="t-body-semi text-cta hover:underline text-left truncate">{w.withdrawalId}</button>
                      <span className="t-caption text-muted-foreground">{w.accountName} · {w.investmentAccountNo}</span>
                    </div>
                    <Td><span className="t-body tabular-nums">{kes(w.availableBalance)}</span></Td>
                    <Td><span className="t-body-med tabular-nums">{kes(w.requestedAmount)}</span></Td>
                    <Td muted>{w.createdBy}</Td>
                    <Td muted>{w.requestedDate}</Td>
                    <Td>
                      <div className="flex flex-col gap-1">
                        <Badge variant="danger">Failed</Badge>
                        <span className="t-caption text-muted-foreground line-clamp-2">{w.failureReason}</span>
                      </div>
                    </Td>
                    <Td>
                      <RowMenu items={[
                        { label: "View", icon: <Eye size={14} strokeWidth={1.75} />, onClick: () => setViewing(w) },
                        { label: "Retry", icon: <RefreshCw size={14} strokeWidth={1.75} />, onClick: () => handleRetry(w) },
                      ]} />
                    </Td>
                  </TableGridRow>
                ))}
              </TableBody>
            </TableGrid>
            <span className="t-body text-muted-foreground">{failed.length} failed</span>
          </div>
        )}
          </>
        )}
      </PageShell>

      {/* Modals */}
      {(showForm || editing) && (
        <WithdrawalForm
          prefill={editing ?? undefined}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSubmit={handleSubmit}
        />
      )}
      {viewing && <WithdrawalDetailModal withdrawal={viewing} onClose={() => setViewing(null)}
        onEdit={(w) => { setViewing(null); setEditing(w); setShowForm(true); }} />}
    </>
  );
}
