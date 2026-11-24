import { useState, useEffect } from "react";
import { Landmark, User, FileText, CreditCard, Smartphone } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card, CardHeader, CardBody } from "./ui/Card";
import { Alert } from "./ui/Alert";
import { ConfirmModal } from "./ui/ConfirmModal";
import { Toggle } from "./ui/Toggle";
import { useToast } from "./ui/Toast";
import { getCustomer, fullName } from "../data/customers";
import type { AccountDetail, WithdrawalBank, WithdrawalMobile } from "../data/accounts";

/* ─── Shared primitives ──────────────────────────────────────────── */

function ReadonlyInput({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="t-label text-foreground">{label}</label>
      <div className="flex items-center h-11 rounded-md border border-border bg-muted px-3.5 cursor-not-allowed">
        <span className="t-body text-muted-foreground select-none">{value ?? "—"}</span>
      </div>
    </div>
  );
}

function FormSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="t-label text-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-md border border-border bg-background px-3.5 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors">
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "bank" ? "Bank Transfer" : o === "mobile" ? "Mobile Money" : o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Section({ icon, title, cols = 2, children }: {
  icon: React.ReactNode; title: string; cols?: 2 | 3 | 4; children: React.ReactNode;
}) {
  const g = cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-3" : "grid-cols-4";
  return (
    <Card>
      <CardHeader icon={icon} title={title} />
      <div className={`px-5 py-5 grid gap-x-8 gap-y-5 ${g}`}>{children}</div>
    </Card>
  );
}

/* ─── Withdrawal slot state ──────────────────────────────────────── */

interface BankState {
  method: "bank";
  bankName: string; accountName: string; accountNumber: string;
  bankCode: string; swiftCode: string; branch: string; branchCode: string;
  addressLine1: string; city: string; country: string; postalAddress: string; postalCode: string;
}

interface MobileState {
  method: "mobile";
  provider: string; phoneNumber: string; accountName: string;
}

type SlotState = BankState | MobileState;

const emptyBank = (): BankState => ({ method: "bank", bankName: "", accountName: "", accountNumber: "", bankCode: "", swiftCode: "", branch: "", branchCode: "", addressLine1: "", city: "", country: "", postalAddress: "", postalCode: "" });
const emptyMobile = (): MobileState => ({ method: "mobile", provider: "", phoneNumber: "", accountName: "" });

function fromWithdrawal(w: WithdrawalBank | WithdrawalMobile | undefined): SlotState {
  if (!w) return emptyBank();
  if (w.method === "bank") return { ...w };
  return { ...w };
}

/* ─── WithdrawalSlot component ───────────────────────────────────── */

function WithdrawalSlot({ label, state, onChange }: {
  label: "Primary" | "Secondary";
  state: SlotState;
  onChange: (s: SlotState) => void;
}) {
  const isBank = state.method === "bank";
  const b = state as BankState;
  const m = state as MobileState;
  const set = (field: string, val: string) => onChange({ ...state, [field]: val } as SlotState);

  return (
    <div className="flex flex-col gap-5">
      {/* Slot label + method dropdown */}
      <div className="flex items-center gap-4">
        <span className={`shrink-0 t-label px-2.5 py-1 rounded-sm ${label === "Primary" ? "bg-primary/10 text-primary" : "bg-panel text-muted-foreground"}`}>
          {label}
        </span>
        <div className="w-48">
          <FormSelect
            label=""
            value={isBank ? "bank" : "mobile"}
            options={["bank", "mobile"]}
            onChange={(v) => onChange(v === "bank" ? emptyBank() : emptyMobile())}
          />
        </div>
        <span className="t-caption text-muted-foreground">
          {isBank ? "Bank Transfer" : "Mobile Money"}
        </span>
      </div>

      {isBank ? (
        <>
          <div className="grid grid-cols-4 gap-x-8 gap-y-5">
            <Input label="Bank Name"           value={b.bankName}       onChange={(e) => set("bankName",       e.target.value)} />
            <Input label="Bank Account Number" value={b.accountNumber}  onChange={(e) => set("accountNumber",  e.target.value)} />
            <Input label="Bank Code"           value={b.bankCode}       onChange={(e) => set("bankCode",       e.target.value)} />
            <Input label="SWIFT Code"          value={b.swiftCode}      onChange={(e) => set("swiftCode",      e.target.value)} />
            <Input label="Branch"              value={b.branch}         onChange={(e) => set("branch",         e.target.value)} />
            <Input label="Branch Code"         value={b.branchCode}     onChange={(e) => set("branchCode",     e.target.value)} />
            <Input label="Account Name"        value={b.accountName}    onChange={(e) => set("accountName",    e.target.value)} />
          </div>
          <div className="pt-4 border-t border-border-light flex flex-col gap-4">
            <span className="t-label text-muted-foreground">Bank Address</span>
            <div className="grid grid-cols-4 gap-x-8 gap-y-5">
              <div className="col-span-4">
                <Input label="Address Line 1" value={b.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} />
              </div>
              <Input label="City"           value={b.city}          onChange={(e) => set("city",          e.target.value)} />
              <Input label="Country"        value={b.country}       onChange={(e) => set("country",       e.target.value)} />
              <Input label="Postal Address" value={b.postalAddress} onChange={(e) => set("postalAddress", e.target.value)} />
              <Input label="Postal Code"    value={b.postalCode}    onChange={(e) => set("postalCode",    e.target.value)} />
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
          <FormSelect label="Provider" value={m.provider}
            options={["", "M-Pesa", "Airtel Money", "T-Kash"]}
            onChange={(v) => set("provider", v)} />
          <Input label="Phone Number" value={m.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} placeholder="+254 7xx xxx xxx" />
          <Input label="Account Name" value={m.accountName} onChange={(e) => set("accountName", e.target.value)} />
        </div>
      )}
    </div>
  );
}

/* ─── Main modal ─────────────────────────────────────────────────── */

interface AccountEditModalProps {
  account: AccountDetail | null;
  onClose: () => void;
  onSaved?: (updated: AccountDetail) => void;
}

export function AccountEditModal({ account, onClose, onSaved }: AccountEditModalProps) {
  const toast = useToast();
  const [saving, setSaving]           = useState(false);
  const [confirming, setConfirming]   = useState(false);
  const [changeReason, setChangeReason] = useState("");

  const [signingInstructions, setSigningInstructions] = useState("");
  const [primarySlot, setPrimarySlot]     = useState<SlotState>(emptyBank());
  const [hasSecondary, setHasSecondary]   = useState(false);
  const [secondarySlot, setSecondarySlot] = useState<SlotState>(emptyMobile());

  useEffect(() => {
    if (!account) return;
    setSigningInstructions(account.signingInstructions ?? "");
    setPrimarySlot(fromWithdrawal(account.primaryWithdrawal));
    setHasSecondary(!!account.secondaryWithdrawal);
    setSecondarySlot(fromWithdrawal(account.secondaryWithdrawal));
    setChangeReason("");
  }, [account?.accountNo]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!account) return null;

  const customer = account.cifId ? getCustomer(account.cifId) : undefined;

  function buildDiff() {
    type DiffRow = { label: string; from: string; to: string };
    const rows: DiffRow[] = [];
    const chk = (label: string, orig: string | undefined, curr: string) => {
      if ((orig ?? "") !== curr) rows.push({ label, from: orig || "—", to: curr || "—" });
    };
    chk("Signing Instructions", account.signingInstructions, signingInstructions);
    const p = account.primaryWithdrawal;
    if (primarySlot.method === "bank") {
      chk("Primary · Bank Name",    p?.method === "bank" ? p.bankName    : "", primarySlot.bankName);
      chk("Primary · Acct Number",  p?.method === "bank" ? p.accountNumber : "", primarySlot.accountNumber);
      chk("Primary · SWIFT",        p?.method === "bank" ? p.swiftCode   : "", primarySlot.swiftCode);
      chk("Primary · Branch",       p?.method === "bank" ? p.branch      : "", primarySlot.branch);
    } else {
      chk("Primary · Provider",     p?.method === "mobile" ? p.provider    : "", primarySlot.provider);
      chk("Primary · Phone",        p?.method === "mobile" ? p.phoneNumber : "", primarySlot.phoneNumber);
    }
    const s = account.secondaryWithdrawal;
    if (hasSecondary) {
      if (secondarySlot.method === "bank") {
        chk("Secondary · Bank Name", s?.method === "bank" ? s.bankName : "", secondarySlot.bankName);
      } else {
        chk("Secondary · Provider",  s?.method === "mobile" ? s.provider    : "", secondarySlot.provider);
        chk("Secondary · Phone",     s?.method === "mobile" ? s.phoneNumber : "", secondarySlot.phoneNumber);
      }
    }
    return rows;
  }

  function handleSave() { setChangeReason(""); setConfirming(true); }

  function executeSave() {
    setConfirming(false);
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({ variant: "success", title: "Submitted for approval", description: `Changes to account ${account.accountNo} have been submitted to a checker.` });
      onClose();
    }, 600);
  }

  const diff = buildDiff();

  return (
    <>
      <Modal open={!!account} onClose={onClose} size="xl" disableBackdropClose>
        <ModalHeader
          title={`Edit Account — ${account.accountNo}`}
          description={`${account.product} · ${account.holderName}`}
          adornment={
            <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Landmark size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" />
            </span>
          }
          onClose={onClose}
        />
        <ModalBody flush>
          <div className="px-6 py-5 flex flex-col gap-5">

            {/* Account info — read-only */}
            <Section icon={<Landmark size={15} strokeWidth={2} aria-hidden="true" />} title="Investment Account Information" cols={3}>
              <ReadonlyInput label="Account Number" value={account.accountNo} />
              <ReadonlyInput label="Account Type"   value={account.accountType} />
              <ReadonlyInput label="Product"        value={account.product} />
              <ReadonlyInput label="Currency"       value={account.currency} />
              <ReadonlyInput label="Opening Date"   value={account.opened} />
            </Section>

            {/* Customer info — read-only */}
            <Section icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Customer Information" cols={3}>
              <ReadonlyInput label="Account Holder" value={account.holderName} />
              <ReadonlyInput label="CIF"            value={account.cifId} />
              <ReadonlyInput label="KYC Status"     value={account.kyc} />
              <ReadonlyInput label="Email"          value={customer?.emailMasked} />
              <ReadonlyInput label="Phone"          value={customer?.phoneMasked} />
            </Section>

            {/* Signing instructions */}
            <Section icon={<FileText size={15} strokeWidth={2} aria-hidden="true" />} title="Signing Instructions" cols={4}>
              <div className="col-span-4 flex flex-col gap-1.5">
                <label className="t-label text-foreground">Signing Instructions</label>
                <textarea value={signingInstructions} onChange={(e) => setSigningInstructions(e.target.value)}
                  rows={2} placeholder="e.g. Single signatory. Account holder only."
                  className="rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none" />
              </div>
            </Section>

            {/* Primary withdrawal */}
            <Card>
              <CardHeader icon={<CreditCard size={15} strokeWidth={2} aria-hidden="true" />} title="Withdrawal Details" />
              <div className="px-5 py-5 flex flex-col gap-6">
                <WithdrawalSlot label="Primary" state={primarySlot} onChange={setPrimarySlot} />

                {/* Secondary toggle */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="t-body-med">Secondary withdrawal method</span>
                    <span className="t-caption text-muted-foreground">Optional — bank or mobile money</span>
                  </div>
                  <Toggle checked={hasSecondary} onChange={setHasSecondary} />
                </div>

                {hasSecondary && (
                  <div className="pt-2">
                    <WithdrawalSlot label="Secondary" state={secondarySlot} onChange={setSecondarySlot} />
                  </div>
                )}
              </div>
            </Card>

          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" loading={saving} onClick={handleSave}>Save changes</Button>
        </ModalFooter>
      </Modal>

      {/* Confirmation with diff + reason */}
      <ConfirmModal
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={executeSave}
        title="Submit for approval"
        subtitle={`${account.accountNo} · ${account.holderName}`}
        description={(
          <div className="flex flex-col gap-4">
            <p className="t-body text-muted-foreground">
              Review the changes you have made before submitting to checker for approval.
            </p>
            {diff.length === 0 ? (
              <p className="t-body text-muted-foreground italic">No changes detected.</p>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1.4fr_1fr_1fr] px-4 py-2.5 bg-muted border-b border-border">
                  <span className="t-label text-muted-foreground">Detail changing</span>
                  <span className="t-label text-muted-foreground">From</span>
                  <span className="t-label text-muted-foreground">To</span>
                </div>
                {diff.map((row, i) => (
                  <div key={row.label} className={`grid grid-cols-[1.4fr_1fr_1fr] px-4 py-3.5 items-start ${i > 0 ? "border-t border-border-light" : ""}`}>
                    <span className="t-body-semi text-primary">{row.label}</span>
                    <span className="t-body text-muted-foreground">{row.from}</span>
                    <span className="t-body text-foreground font-medium">{row.to}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="t-label text-foreground">
                Reason for change <span className="text-danger-fg">*</span>
              </label>
              <textarea value={changeReason} onChange={(e) => setChangeReason(e.target.value)}
                rows={3} placeholder="Explain why this change is being made…"
                className="rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none" />
              {changeReason.trim() === "" && (
                <span className="t-caption text-danger-fg">A reason is required before submitting.</span>
              )}
            </div>
          </div>
        )}
        confirmLabel="Submit for approval"
        cancelLabel="Go back"
        loading={saving}
        disableConfirm={changeReason.trim() === ""}
      />
    </>
  );
}
