import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users, User, Search, Plus, Trash2, ChevronRight,
  CheckCircle2, UserCheck, FileText, Landmark, CreditCard, Smartphone,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardHeader } from "../ui/Card";
import { Alert } from "../ui/Alert";
import { Badge } from "../ui/Badge";
import { Toggle } from "../ui/Toggle";
import { StepperBar } from "./StepperBar";
import { useToast } from "../ui/Toast";
import { TableGrid, TableHead, TableBody, TableGridRow, Th, Td, TableEmpty } from "../ui/Table";
import { useSortable } from "../../lib/useSortable";
import { customers as allCustomers, fullName } from "../../data/customers";
import type { Customer } from "../../data/customers";

/* ─── Types ──────────────────────────────────────────────────────── */
type HolderType = "new" | "existing";

interface PendingCustomer {
  id: string;
  name: string;
  pending: true;
}

interface HolderDef {
  id: string;
  type: HolderType;
  existingCustomer?: Customer;
  pendingCustomer?: PendingCustomer;
}

/* ─── Constants ──────────────────────────────────────────────────── */
const PRODUCTS = [
  { key: "bond",     name: "Co-op Bond Fund",                  minDeposit: "KES 50,000",  taxOnIncome: "15%", minCashOut: "KES 1,000", currency: "KES", description: "Invests in government and corporate bonds for steady income returns." },
  { key: "mmf",      name: "Co-op Money Market Fund",          minDeposit: "KES 1,000",   taxOnIncome: "15%", minCashOut: "KES 500",   currency: "KES", description: "Highly liquid short-term fund suitable for emergency savings." },
  { key: "gratuity", name: "Co-op Fixed Income Gratuity Fund", minDeposit: "KES 100,000", taxOnIncome: "10%", minCashOut: "KES 5,000", currency: "KES", description: "Long-term fixed income fund designed for gratuity and pension management." },
];

const SIGNING_OPTIONS = [
  { value: "any_one",   label: "Any one signatory",       description: "Any holder can authorise transactions independently." },
  { value: "all",       label: "All signatories required", description: "All holders must authorise every transaction." },
  { value: "other",     label: "Other signing instruction", description: "Specify a custom signing arrangement for this account." },
];

/* ─── Withdrawal types ───────────────────────────────────────────── */
interface BankWithdrawal {
  method: "bank";
  bankName: string; accountNumber: string; accountName: string;
  bankCode: string; swiftCode: string; branch: string; branchCode: string;
  addressLine1: string; city: string; country: string;
  postalAddress: string; postalCode: string;
  proofFile?: File | null; pesalinkVerified?: boolean;
}
interface MobileWithdrawal {
  method: "mobile";
  provider: string; phoneNumber: string; accountName: string;
  proofFile?: File | null;
}
type WithdrawalSlot = BankWithdrawal | MobileWithdrawal;

const BANKS = ["Co-operative Bank", "Equity Bank", "KCB Bank", "Standard Chartered", "NCBA Bank", "Absa Bank", "DTB Bank", "Other"];
const MOBILE_PROVIDERS = ["M-Pesa", "Airtel Money", "T-Kash"];
const COOP_BANK = "Co-operative Bank";

/* ─── WithdrawalSlotEditor ───────────────────────────────────────── */
function WithdrawalSlotEditor({ label, slot, onChange, validating, onValidate }: {
  label: "Primary" | "Secondary";
  slot: WithdrawalSlot;
  onChange: (s: WithdrawalSlot) => void;
  validating: boolean;
  onValidate: () => void;
}) {
  const isBank = slot.method === "bank";
  const isCoop = isBank && (slot as BankWithdrawal).bankName === COOP_BANK;
  const b = slot as BankWithdrawal;
  const m = slot as MobileWithdrawal;
  const set = (field: string, val: unknown) => onChange({ ...slot, [field]: val } as WithdrawalSlot);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className={`t-label px-2.5 py-1 rounded-sm ${label === "Primary" ? "bg-primary/10 text-primary" : "bg-panel text-muted-foreground"}`}>{label}</span>
        <div className="flex gap-2">
          <button type="button"
            onClick={() => onChange({ method: "bank", bankName: "", accountNumber: "", accountName: "", bankCode: "", swiftCode: "", branch: "", branchCode: "", addressLine1: "", city: "", country: "", postalAddress: "", postalCode: "", proofFile: null, pesalinkVerified: false })}
            className={`flex items-center gap-2 px-3 h-9 rounded-md border t-body transition-colors ${isBank ? "border-cta bg-cta/5 text-cta font-semibold" : "border-border text-muted-foreground hover:border-cta/40"}`}>
            <CreditCard size={14} strokeWidth={1.75} aria-hidden="true" /> Bank Transfer
          </button>
          <button type="button"
            onClick={() => onChange({ method: "mobile", provider: "", phoneNumber: "", accountName: "", proofFile: null })}
            className={`flex items-center gap-2 px-3 h-9 rounded-md border t-body transition-colors ${!isBank ? "border-cta bg-cta/5 text-cta font-semibold" : "border-border text-muted-foreground hover:border-cta/40"}`}>
            <Smartphone size={14} strokeWidth={1.75} aria-hidden="true" /> Mobile Money
          </button>
        </div>
      </div>

      {isBank ? (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="t-label text-foreground">Bank Name</label>
              <select value={b.bankName} onChange={(e) => set("bankName", e.target.value)}
                className="h-11 rounded-md border border-border bg-background px-3.5 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors">
                <option value="">Select bank…</option>
                {BANKS.map((bk) => <option key={bk} value={bk}>{bk}</option>)}
              </select>
            </div>
            <Input label="Account Number" value={b.accountNumber}
              id={`joint-${label}-account-number`}
              onChange={(e) => onChange({ ...slot, accountNumber: e.target.value, pesalinkVerified: false } as WithdrawalSlot)}
              placeholder="Enter account number" />
          </div>
          {b.bankName && (isCoop ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Button variant="secondary" size="md" loading={validating} disabled={!b.accountNumber.trim()} onClick={onValidate}>Validate account</Button>
                {b.pesalinkVerified && <div className="flex items-center gap-2 text-success-fg"><CheckCircle2 size={14} strokeWidth={1.75} aria-hidden="true" /><span className="t-body-semi">Account verified</span></div>}
              </div>
              {b.pesalinkVerified && (
                <div className="grid grid-cols-3 gap-x-8 gap-y-4 p-4 rounded-lg bg-success-bg border border-success-fg/20">
                  <div className="flex flex-col gap-1"><span className="t-label text-success-fg">Account Name</span><span className="t-body-med">{b.accountName}</span></div>
                  <div className="flex flex-col gap-1"><span className="t-label text-success-fg">Branch</span><span className="t-body">{b.branch}</span></div>
                  <div className="flex flex-col gap-1"><span className="t-label text-success-fg">Branch Code</span><span className="t-body">{b.branchCode}</span></div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-4 gap-x-8 gap-y-5">
                <Input label="Account Name"   id={`joint-${label}-acct-name`}   value={b.accountName}   onChange={(e) => set("accountName",  e.target.value)} />
                <Input label="Bank Code"      id={`joint-${label}-bank-code`}   value={b.bankCode}      onChange={(e) => set("bankCode",     e.target.value)} />
                <Input label="SWIFT Code"     id={`joint-${label}-swift`}       value={b.swiftCode}     onChange={(e) => set("swiftCode",    e.target.value)} />
                <Input label="Branch"         id={`joint-${label}-branch`}      value={b.branch}        onChange={(e) => set("branch",       e.target.value)} />
                <Input label="Branch Code"    id={`joint-${label}-branch-code`} value={b.branchCode}    onChange={(e) => set("branchCode",   e.target.value)} />
                <Input label="Address Line 1" id={`joint-${label}-addr`}        value={b.addressLine1}  onChange={(e) => set("addressLine1", e.target.value)} />
                <Input label="City"           id={`joint-${label}-city`}        value={b.city}          onChange={(e) => set("city",         e.target.value)} />
                <Input label="Country"        id={`joint-${label}-country`}     value={b.country}       onChange={(e) => set("country",      e.target.value)} />
                <Input label="Postal Address" id={`joint-${label}-postal-addr`} value={b.postalAddress} onChange={(e) => set("postalAddress",e.target.value)} />
                <Input label="Postal Code"    id={`joint-${label}-postal-code`} value={b.postalCode}    onChange={(e) => set("postalCode",   e.target.value)} />
              </div>
              <div className="flex items-center gap-2.5">
                <Button variant="secondary" size="md" loading={validating} disabled={!b.accountNumber.trim() || !b.bankName} onClick={onValidate}>Verify via PesaLink</Button>
                {b.pesalinkVerified && <div className="flex items-center gap-2 text-success-fg"><CheckCircle2 size={14} strokeWidth={1.75} aria-hidden="true" /><span className="t-body-semi">PesaLink verified</span></div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="t-label text-foreground">Provider</label>
            <select value={m.provider} onChange={(e) => set("provider", e.target.value)}
              className="h-11 rounded-md border border-border bg-background px-3.5 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors">
              <option value="">Select provider…</option>
              {MOBILE_PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <Input label="Phone Number" id={`joint-${label}-phone`} value={m.phoneNumber} placeholder="+254 7xx xxx xxx" onChange={(e) => set("phoneNumber", e.target.value)} />
          <Input label="Account Name" id={`joint-${label}-mobile-name`} value={m.accountName} onChange={(e) => set("accountName", e.target.value)} />
        </div>
      )}
    </div>
  );
}

/* ─── Shared helpers ─────────────────────────────────────────────── */
function StepShell({ title, description, children, backButton, primaryButton, onSaveDraft }: {
  title: string; description?: string;
  children: React.ReactNode;
  backButton: React.ReactNode;
  primaryButton: React.ReactNode;
  onSaveDraft?: () => void;
}) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="t-heading mb-1">{title}</h2>
        {description && <p className="t-body text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
      <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
        <div>{backButton}</div>
        <div className="flex items-center gap-2.5">
          {onSaveDraft && (
            <Button variant="ghost" size="md" onClick={onSaveDraft}>
              Save as draft
            </Button>
          )}
          <div>{primaryButton}</div>
        </div>
      </div>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500, color: "#A8A7A1" }}>{label}</span>
      <span className="t-body text-foreground">{value || "—"}</span>
    </div>
  );
}

/* ─── Holder Setup Step — two tabs ──────────────────────────────── */
type SetupTab = "existing" | "new";

function HolderSetupStep({ holders, onChange, onContinue, pendingCustomers, onCreateNew }: {
  holders: HolderDef[];
  onChange: (h: HolderDef[]) => void;
  onContinue: () => void;
  pendingCustomers: PendingCustomer[];
  onCreateNew: () => void;
}) {
  const [tab, setTab] = useState<SetupTab>("existing");
  const [query, setQuery] = useState("");

  // Existing customers table
  const filteredExisting = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCustomers;
    return allCustomers.filter((c) =>
      `${fullName(c)} ${c.cifId} ${c.idNumber} ${c.email}`.toLowerCase().includes(q)
    );
  })();
  const { sorted, sortKey, sortDir, toggleSort } = useSortable(
    filteredExisting as unknown as Record<string, unknown>[],
    "lastName"
  );

  // Check if already added
  function isAdded(id: string) {
    return holders.some(
      (h) => h.existingCustomer?.cifId === id || h.pendingCustomer?.id === id
    );
  }

  function addExisting(c: Customer) {
    onChange([...holders, { id: crypto.randomUUID(), type: "existing", existingCustomer: c }]);
  }

  function addPending(p: PendingCustomer) {
    onChange([...holders, { id: crypto.randomUUID(), type: "new", pendingCustomer: p }]);
  }

  function removeHolder(id: string) {
    onChange(holders.filter((h) => h.id !== id));
  }

  const filledHolders = holders.filter((h) => h.existingCustomer || h.pendingCustomer);
  const canContinue   = filledHolders.length >= 2;
  const EXIST_COLS    = "2fr 1.4fr 1.8fr 1.4fr 1fr 110px";
  const PEND_COLS     = "2fr 1.2fr 1.2fr 110px";

  return (
    <StepShell
      title="Joint Account Holders"
      description="Select at least two holders. Search existing customers or add a new customer."
      backButton={<div />}
      primaryButton={
        <Button variant="primary" disabled={!canContinue} onClick={onContinue}>
          Continue
        </Button>
      }
    >
      {/* Selected holders */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="t-label text-muted-foreground">
            Selected holders {filledHolders.length > 0 ? `(${filledHolders.length})` : ""}
          </span>
          {!canContinue && filledHolders.length > 0 && (
            <span className="t-caption text-muted-foreground">Add at least {2 - filledHolders.length} more to continue</span>
          )}
        </div>

        {filledHolders.length === 0 ? (
          <div className="flex items-center gap-3 px-4 py-4 rounded-xl border border-dashed border-border bg-muted/20">
            <Users size={16} strokeWidth={1.75} className="text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="t-body text-muted-foreground">No customers selected yet. Use the table below to add holders.</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filledHolders.map((h, i) => {
              const name = h.existingCustomer ? fullName(h.existingCustomer) : h.pendingCustomer?.name ?? "";
              const sub = h.existingCustomer
                ? `CIF ${h.existingCustomer.cifId} · ${h.existingCustomer.idType} ${h.existingCustomer.idNumber}`
                : "Pending approval";
              return (
                <div key={h.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-cta/20 bg-cta/5">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-semibold">{i + 1}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="t-body-semi truncate">{name}</span>
                    <span className="t-caption text-muted-foreground truncate">{sub}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {h.pendingCustomer && <Badge variant="warn">Pending</Badge>}
                    {h.existingCustomer && <Badge variant="success">Existing</Badge>}
                    <button type="button" onClick={() => removeHolder(h.id)}
                      className="text-muted-foreground hover:text-danger-fg transition-colors"
                      aria-label={`Remove ${name}`}>
                      <Trash2 size={13} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {([
          { key: "existing" as SetupTab, label: "Existing Customers" },
          { key: "new"      as SetupTab, label: "New Customers" },
        ]).map((t) => (
          <button key={t.key} type="button" onClick={() => { setTab(t.key); setQuery(""); }}
            className={`px-4 py-1.5 rounded-md t-body-semi transition-colors ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Existing customers tab ── */}
      {tab === "existing" && (
        <div className="flex flex-col gap-3">
          <Input placeholder="Search by name, CIF, ID, or email" value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftSlot={<Search size={16} strokeWidth={1.75} aria-hidden="true" />} />
          <TableGrid>
            <TableHead>
              <TableGridRow cols={EXIST_COLS} head>
                <Th sort={sortKey === "firstName" ? sortDir : null} onSort={() => toggleSort("firstName")}>Customer</Th>
                <Th>Identification</Th>
                <Th sort={sortKey === "emailMasked" ? sortDir : null} onSort={() => toggleSort("emailMasked")}>Email</Th>
                <Th>Phone</Th>
                <Th sort={sortKey === "dateOnboarded" ? sortDir : null} onSort={() => toggleSort("dateOnboarded")}>Onboarded</Th>
                <Th />
              </TableGridRow>
            </TableHead>
            <TableBody>
              {sorted.length === 0
                ? <TableEmpty>No customers match your search.</TableEmpty>
                : (sorted as unknown as Customer[]).map((c) => (
                  <TableGridRow key={c.cifId} cols={EXIST_COLS}>
                    <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                      <span className="t-body-med truncate">{fullName(c)}</span>
                      <span className="t-caption text-muted-foreground">CIF {c.cifId}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <Td>{c.idType}</Td>
                      <span className="t-caption text-muted-foreground">{c.idMasked}</span>
                    </div>
                    <Td className="truncate pr-3">{c.emailMasked}</Td>
                    <Td muted>{c.phoneMasked}</Td>
                    <Td muted>{c.dateOnboarded}</Td>
                    <div className="flex items-center justify-end">
                      {isAdded(c.cifId)
                        ? <span className="t-caption text-success-fg flex items-center gap-1"><CheckCircle2 size={13} strokeWidth={2} aria-hidden="true" /> Added</span>
                        : <Button variant="secondary" size="sm" onClick={() => addExisting(c)}>Add</Button>}
                    </div>
                  </TableGridRow>
                ))}
            </TableBody>
          </TableGrid>
          <span className="t-caption text-muted-foreground">{sorted.length} of {allCustomers.length} customers</span>
        </div>
      )}

      {/* ── New customers tab ── */}
      {tab === "new" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="t-body text-muted-foreground">
              Customers submitted for onboarding but not yet approved appear here.
            </p>
            <Button variant="primary" size="md"
              leftIcon={<Plus size={15} strokeWidth={1.75} aria-hidden="true" />}
              onClick={onCreateNew}>
              Create new customer
            </Button>
          </div>

          {pendingCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 border border-dashed border-border rounded-xl text-center">
              <Users size={24} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />
              <p className="t-body-semi">No pending customers</p>
              <p className="t-caption text-muted-foreground">Click "Create new customer" to onboard a new customer and add them as a holder.</p>
            </div>
          ) : (
            <TableGrid>
              <TableHead>
                <TableGridRow cols={PEND_COLS} head>
                  <Th>Name</Th>
                  <Th>Status</Th>
                  <Th>Submitted</Th>
                  <Th />
                </TableGridRow>
              </TableHead>
              <TableBody>
                {pendingCustomers.map((p) => (
                  <TableGridRow key={p.id} cols={PEND_COLS}>
                    <div className="flex flex-col gap-0.5">
                      <span className="t-body-med">{p.name}</span>
                      <span className="t-caption text-muted-foreground">Pending approval</span>
                    </div>
                    <div><Badge variant="warn" dot>Pending</Badge></div>
                    <Td muted>Just now</Td>
                    <div className="flex items-center justify-end">
                      {isAdded(p.id)
                        ? <span className="t-caption text-success-fg flex items-center gap-1"><CheckCircle2 size={13} strokeWidth={2} aria-hidden="true" /> Added</span>
                        : <Button variant="secondary" size="sm" onClick={() => addPending(p)}>Add</Button>}
                    </div>
                  </TableGridRow>
                ))}
              </TableBody>
            </TableGrid>
          )}
        </div>
      )}
    </StepShell>
  );
}

/* ─── Main JointJourney component ───────────────────────────────── */
export function JointJourney() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Read returned pending customer from individual onboarding
  const locationState = (location.state ?? {}) as Record<string, unknown>;
  const returnedPending = locationState.pendingCustomer as PendingCustomer | undefined;

  const [holders, setHolders] = useState<HolderDef[]>([
    { id: crypto.randomUUID(), type: "existing" },
    { id: crypto.randomUUID(), type: "existing" },
  ]);

  // Pending customers list (new customers submitted but not yet approved)
  const [pendingCustomers, setPendingCustomers] = useState<PendingCustomer[]>([
    { id: "PENDING-001", name: "David Mwangi Kariuki",  pending: true },
    { id: "PENDING-002", name: "Esther Njeri Wambua",   pending: true },
    { id: "PENDING-003", name: "Brian Omondi Otieno",   pending: true },
  ]);

  // Auto-add returned pending customer on mount
  useEffect(() => {
    if (!returnedPending) return;
    // Add to pending list
    setPendingCustomers((p) => {
      if (p.some((x) => x.id === returnedPending.id)) return p;
      return [...p, returnedPending];
    });
    // Auto-fill the first empty slot
    setHolders((prev) => {
      const slot = prev.findIndex((h) => !h.existingCustomer && !h.pendingCustomer);
      if (slot === -1) return [...prev, { id: crypto.randomUUID(), type: "new", pendingCustomer: returnedPending }];
      return prev.map((h, i) => i === slot ? { ...h, type: "new", pendingCustomer: returnedPending } : h);
    });
    // Clear state so it doesn't re-trigger on re-render
    window.history.replaceState({ ...locationState, pendingCustomer: undefined }, "");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [phase, setPhase] = useState<"holders" | "account" | "review">("holders");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [accountName, setAccountName] = useState("");
  const [signingRule, setSigningRule] = useState("any_one");
  const [customSigningInstruction, setCustomSigningInstruction] = useState("");

  // ARO
  const [aroUsername, setAroUsername] = useState("");
  const [aroCode, setAroCode]         = useState("");
  const [fetchingAro, setFetchingAro] = useState(false);

  // Withdrawal
  const [primaryWithdrawal, setPrimaryWithdrawal] = useState<WithdrawalSlot>({
    method: "bank", bankName: "", accountNumber: "", accountName: "",
    bankCode: "", swiftCode: "", branch: "", branchCode: "",
    addressLine1: "", city: "", country: "", postalAddress: "", postalCode: "",
    proofFile: null, pesalinkVerified: false,
  });
  const [hasSecondary, setHasSecondary]     = useState(false);
  const [secondaryWithdrawal, setSecondaryWithdrawal] = useState<WithdrawalSlot>({
    method: "mobile", provider: "", phoneNumber: "", accountName: "", proofFile: null,
  });
  const [validatingPrimary, setValidatingPrimary] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Build stepper
  const steps = [
    { key: "holders", label: "Holders" },
    { key: "account", label: "Account" },
    { key: "review",  label: "Review"  },
  ];
  const currentStepIndex = phase === "holders" ? 0 : phase === "account" ? 1 : 2;

  const holderNames = holders.map((h, i) =>
    h.existingCustomer ? fullName(h.existingCustomer)
    : h.pendingCustomer ? h.pendingCustomer.name
    : `Holder ${i + 1}`
  );

  const filledHolders = holders.filter((h) => h.existingCustomer || h.pendingCustomer);

  function handleCreateNew() {
    navigate("/onboard-customer", {
      state: {
        jointReturn: true,
        // preserve any existing location state
        ...locationState,
      },
    });
  }

  function handleSubmit() {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setShowSuccess(true); }, 1200);
  }

  function handleSaveDraft() {
    toast({ variant: "success", title: "Draft saved", description: "You can resume from the Drafts tab on the Customers page." });
    navigate("/customers");
  }

  function fetchAroCode() {
    if (!aroUsername.trim()) return;
    setFetchingAro(true);
    setTimeout(() => {
      setFetchingAro(false);
      setAroCode("ARO-" + Math.floor(Math.random() * 9000 + 1000));
    }, 800);
  }

  function validatePrimaryBank() {
    const slot = primaryWithdrawal as BankWithdrawal;
    if (slot.bankName !== COOP_BANK) return;
    setValidatingPrimary(true);
    setTimeout(() => {
      setValidatingPrimary(false);
      setPrimaryWithdrawal((prev) => ({
        ...prev,
        accountName: "Auto-filled Name",
        branch: "Upper Hill Branch",
        branchCode: "0055",
        pesalinkVerified: true,
      } as BankWithdrawal));
    }, 1000);
  }

  return (
    <div>
      <StepperBar steps={steps} current={currentStepIndex} />

      {/* ── PHASE: Holder Setup ── */}
      {phase === "holders" && (
        <HolderSetupStep
          holders={holders}
          onChange={setHolders}
          pendingCustomers={pendingCustomers}
          onCreateNew={handleCreateNew}
          onContinue={() => setPhase("account")}
        />
      )}

      {/* ── PHASE: Account Setup ── */}
      {phase === "account" && (
        <StepShell
          title="Investment Account"
          description="Select the fund and configure the joint account details."
          backButton={<Button variant="ghost" onClick={() => setPhase("holders")}>Back</Button>}
          primaryButton={
            <Button variant="primary"
              disabled={!selectedProduct || !accountName.trim() || (signingRule === "other" && !customSigningInstruction.trim())}
              onClick={() => setPhase("review")}>
              Continue to review
            </Button>
          }
          onSaveDraft={handleSaveDraft}
        >
          {/* Holders summary */}
          <Card>
            <CardHeader icon={<Users size={15} strokeWidth={2} aria-hidden="true" />} title="Account Holders" />
            <div className="px-5 py-5 flex flex-col gap-3">
              {holders.filter((h) => h.existingCustomer || h.pendingCustomer).map((h, i) => (
                <div key={h.id} className="flex items-center gap-3 px-4 py-3 bg-muted rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-semibold">{i + 1}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="t-body-med truncate">{holderNames[holders.indexOf(h)]}</span>
                    <span className="t-caption text-muted-foreground">
                      {h.existingCustomer ? `CIF ${h.existingCustomer.cifId} · Existing` : "Pending approval · New customer"}
                    </span>
                  </div>
                  <Badge variant={h.existingCustomer ? "success" : "warn"}>
                    {h.existingCustomer ? "Existing" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Product cards */}
          <div className="grid grid-cols-3 gap-4">
            {PRODUCTS.map((p) => {
              const gradients: Record<string, string> = {
                bond:     "linear-gradient(135deg, #004E38 0%, #006B4F 60%, #005240 100%)",
                mmf:      "linear-gradient(135deg, #0a4a7a 0%, #1565a8 60%, #0d5490 100%)",
                gratuity: "linear-gradient(135deg, #8B6914 0%, #C7A034 60%, #A07C20 100%)",
              };
              const isSelected = selectedProduct === p.key;
              return (
                <button key={p.key} type="button" onClick={() => setSelectedProduct(p.key)}
                  className={["text-left rounded-2xl overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta",
                    isSelected ? "border-cta ring-2 ring-cta/30" : "border-transparent hover:border-cta/30"].join(" ")}>
                  <div className="relative px-5 pt-5 pb-4 flex flex-col gap-2" style={{ background: gradients[p.key] }}>
                    <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(ellipse at 80% 20%, #fff 0%, transparent 60%)" }} />
                    <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-white bg-white" : "border-white/40"}`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-cta" />}
                    </div>
                    <span className="t-label text-white/70 relative z-10">Investment Fund</span>
                    <span className="t-subheading text-white relative z-10 leading-snug">{p.name}</span>
                    <span className="t-caption text-white/60 relative z-10 line-clamp-2">{p.description}</span>
                  </div>
                  <div className="bg-card border-t border-border px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-3">
                    {[
                      { label: "Min. Deposit",  value: p.minDeposit },
                      { label: "Tax on Income", value: p.taxOnIncome },
                      { label: "Min. Cash Out", value: p.minCashOut },
                      { label: "Currency",      value: p.currency },
                    ].map((kv) => (
                      <div key={kv.label} className="flex flex-col gap-0.5">
                        <span className="t-label text-muted-foreground">{kv.label}</span>
                        <span className="t-body-semi text-foreground">{kv.value}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Account name + ARO + signing + withdrawal */}
          {selectedProduct && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="t-label text-muted-foreground px-2">Account Setup</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <Card>
                <CardHeader icon={<Landmark size={15} strokeWidth={2} aria-hidden="true" />} title="Account Details" />
                <div className="px-5 py-5 flex flex-col gap-5">
                  <Input label="Investment Account Name *" id="joint-account-name" value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder={filledHolders.map((h) => h.existingCustomer ? fullName(h.existingCustomer) : h.pendingCustomer?.name ?? "").join(" & ")} />
                  {/* ARO code */}
                  <div className="flex flex-col gap-1.5">
                    <label className="t-label text-foreground">ARO Code <span className="t-caption text-muted-foreground">(optional)</span></label>
                    <div className="flex items-center gap-2.5">
                      <Input id="joint-aro-username" placeholder="Enter ARO username" value={aroUsername}
                        onChange={(e) => { setAroUsername(e.target.value); setAroCode(""); }} />
                      <Button variant="secondary" size="md" loading={fetchingAro} disabled={!aroUsername.trim()} onClick={fetchAroCode}>Fetch code</Button>
                      {aroCode && (
                        <div className="flex items-center gap-2 px-3 h-11 rounded-md bg-success-bg border border-success-fg/20 shrink-0">
                          <CheckCircle2 size={14} strokeWidth={1.75} className="text-success-fg" aria-hidden="true" />
                          <span className="t-body-semi text-success-fg">{aroCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Signing instructions */}
                  <div className="flex flex-col gap-2">
                    <label className="t-label text-foreground">Signing Instructions *</label>
                    <p className="t-caption text-muted-foreground">Define how transactions must be authorised for this joint account.</p>
                    <div className="flex flex-col gap-2 mt-1">
                      {SIGNING_OPTIONS.map((opt) => (
                        <label key={opt.value}
                          className={`flex items-start gap-3 px-4 py-3.5 rounded-lg border cursor-pointer transition-colors ${signingRule === opt.value ? "border-cta bg-cta/5" : "border-border hover:border-cta/40"}`}>
                          <input type="radio" name="signing" value={opt.value} checked={signingRule === opt.value}
                            onChange={() => setSigningRule(opt.value)} className="mt-0.5 accent-cta shrink-0" />
                          <div className="flex flex-col gap-0.5">
                            <span className="t-body-semi">{opt.label}</span>
                            <span className="t-caption text-muted-foreground">{opt.description}</span>
                          </div>
                        </label>
                      ))}
                      {signingRule === "other" && (
                        <div className="flex flex-col gap-1.5 mt-1">
                          <label className="t-label text-foreground">Custom signing instruction <span className="text-danger-fg">*</span></label>
                          <textarea value={customSigningInstruction} onChange={(e) => setCustomSigningInstruction(e.target.value)}
                            rows={3} placeholder="Describe the signing arrangement…"
                            className="w-full rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Withdrawal details */}
              <Card>
                <CardHeader icon={<CreditCard size={15} strokeWidth={2} aria-hidden="true" />} title="Withdrawal Details" />
                <div className="px-5 py-5 flex flex-col gap-6">
                  <WithdrawalSlotEditor label="Primary" slot={primaryWithdrawal} onChange={setPrimaryWithdrawal}
                    validating={validatingPrimary} onValidate={validatePrimaryBank} />
                  <div className="pt-4 border-t border-border">
                    <Toggle checked={hasSecondary} onChange={setHasSecondary}
                      label="Add secondary withdrawal method"
                      description="Optional — a second bank or mobile money account" />
                  </div>
                  {hasSecondary && (
                    <WithdrawalSlotEditor label="Secondary" slot={secondaryWithdrawal} onChange={setSecondaryWithdrawal}
                      validating={false} onValidate={() => {}} />
                  )}
                </div>
              </Card>
            </div>
          )}
        </StepShell>
      )}

      {/* ── PHASE: Review ── */}
      {phase === "review" && (() => {
        const product = PRODUCTS.find((p) => p.key === selectedProduct);
        const signingLabel = SIGNING_OPTIONS.find((o) => o.value === signingRule)?.label;
        const filledHolders = holders.filter((h) => h.existingCustomer || h.pendingCustomer);
        return (
          <StepShell
            title="Review & Submit"
            description="Confirm all details before submitting for checker approval."
            backButton={<Button variant="ghost" onClick={() => setPhase("account")}>Back</Button>}
            primaryButton={<Button variant="primary" loading={submitting} onClick={handleSubmit}>Submit for approval</Button>}
          >
            <Alert variant="warn">
              Please review all details carefully. Once submitted, changes will require a new request.
            </Alert>

            <Card>
              <CardHeader icon={<Users size={15} strokeWidth={2} aria-hidden="true" />} title="Account Holders" />
              <div className="px-5 py-5 flex flex-col gap-4">
                {filledHolders.map((h, i) => (
                  <div key={h.id} className={`flex flex-col gap-3 ${i > 0 ? "pt-4 border-t border-border-light" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span className="t-label px-2 py-0.5 rounded-sm bg-primary/10 text-primary">Holder {i + 1}</span>
                      <Badge variant={h.existingCustomer ? "success" : "warn"}>{h.existingCustomer ? "Existing" : "Pending"}</Badge>
                    </div>
                    {h.existingCustomer ? (
                      <div className="grid grid-cols-4 gap-x-8 gap-y-3">
                        <ReviewField label="Full Name"  value={fullName(h.existingCustomer)} />
                        <ReviewField label="CIF"        value={h.existingCustomer.cifId} />
                        <ReviewField label="ID"         value={`${h.existingCustomer.idType} · ${h.existingCustomer.idMasked}`} />
                        <ReviewField label="KYC Status" value={h.existingCustomer.kyc === "verified" ? "Verified" : "Pending"} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-x-8 gap-y-3">
                        <ReviewField label="Name"   value={h.pendingCustomer?.name} />
                        <ReviewField label="Status" value="Pending approval" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader icon={<Landmark size={15} strokeWidth={2} aria-hidden="true" />} title="Investment Account" />
              <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-4">
                <ReviewField label="Fund"                 value={product?.name ?? "—"} />
                <ReviewField label="Account Name"         value={accountName} />
                <ReviewField label="Currency"             value={product?.currency ?? "KES"} />
                <ReviewField label="Min. Deposit"         value={product?.minDeposit ?? "—"} />
                <ReviewField label="Signing Instructions" value={signingRule === "other" ? customSigningInstruction : signingLabel} />
                <ReviewField label="Tax on Income"        value={product?.taxOnIncome ?? "—"} />
                {aroCode && <ReviewField label="ARO Code" value={aroCode} />}
              </div>
            </Card>

            {/* Withdrawal */}
            <Card>
              <CardHeader icon={<CreditCard size={15} strokeWidth={2} aria-hidden="true" />} title="Withdrawal Details" />
              <div className="px-5 py-5 flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  <span className="t-label text-muted-foreground">Primary · {primaryWithdrawal.method === "bank" ? "Bank Transfer" : "Mobile Money"}</span>
                  {primaryWithdrawal.method === "bank" ? (
                    <div className="grid grid-cols-4 gap-x-8 gap-y-3">
                      <ReviewField label="Bank"           value={(primaryWithdrawal as BankWithdrawal).bankName} />
                      <ReviewField label="Account Number" value={(primaryWithdrawal as BankWithdrawal).accountNumber} />
                      <ReviewField label="Account Name"   value={(primaryWithdrawal as BankWithdrawal).accountName} />
                      {(primaryWithdrawal as BankWithdrawal).branch && <ReviewField label="Branch" value={(primaryWithdrawal as BankWithdrawal).branch} />}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                      <ReviewField label="Provider" value={(primaryWithdrawal as MobileWithdrawal).provider} />
                      <ReviewField label="Phone"    value={(primaryWithdrawal as MobileWithdrawal).phoneNumber} />
                      <ReviewField label="Name"     value={(primaryWithdrawal as MobileWithdrawal).accountName} />
                    </div>
                  )}
                </div>
                {hasSecondary && (
                  <div className="flex flex-col gap-3 pt-4 border-t border-border">
                    <span className="t-label text-muted-foreground">Secondary · {secondaryWithdrawal.method === "bank" ? "Bank Transfer" : "Mobile Money"}</span>
                    {secondaryWithdrawal.method === "mobile" ? (
                      <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                        <ReviewField label="Provider" value={(secondaryWithdrawal as MobileWithdrawal).provider} />
                        <ReviewField label="Phone"    value={(secondaryWithdrawal as MobileWithdrawal).phoneNumber} />
                        <ReviewField label="Name"     value={(secondaryWithdrawal as MobileWithdrawal).accountName} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-x-8 gap-y-3">
                        <ReviewField label="Bank"           value={(secondaryWithdrawal as BankWithdrawal).bankName} />
                        <ReviewField label="Account Number" value={(secondaryWithdrawal as BankWithdrawal).accountNumber} />
                        <ReviewField label="Account Name"   value={(secondaryWithdrawal as BankWithdrawal).accountName} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </StepShell>
        );
      })()}

      {showSuccess && (
        <JointSuccessModal
          accountName={accountName || holders.filter(h => h.existingCustomer || h.pendingCustomer).map((h, i) => holderNames[holders.indexOf(h)]).join(" & ")}
          onGoToAccounts={() => navigate("/investment-accounts")}
        />
      )}
    </div>
  );
}


/* ─── Success modal ──────────────────────────────────────────────── */
function JointSuccessModal({ accountName, onGoToAccounts }: {
  accountName: string;
  onGoToAccounts: () => void;
}) {
  const COLORS = ["#75AF0F", "#004E38", "#C7A034", "#4B9FE1", "#E85D4A", "#F5C518"];
  return (
    <>
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden" aria-hidden="true">
        {Array.from({ length: 100 }).map((_, i) => {
          const color = COLORS[i % COLORS.length];
          const left  = `${Math.random() * 100}%`;
          const delay = `${Math.random() * 1.2}s`;
          const dur   = `${2.2 + Math.random() * 1.5}s`;
          const size  = `${6 + Math.random() * 8}px`;
          const shape = i % 3 === 0 ? "50%" : "2px";
          return (
            <div key={i} style={{
              position: "absolute", left, top: "-20px", width: size, height: size,
              backgroundColor: color, borderRadius: shape,
              animation: `confetti-fall ${dur} ${delay} ease-in forwards`,
            }} />
          );
        })}
        <style>{`@keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(105vh) rotate(720deg); opacity: 0; } }`}</style>
      </div>
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-8">
        <div className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]" aria-hidden="true" />
        <div className="relative z-10 w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center text-center px-8 py-10 gap-5">
          <div className="w-16 h-16 rounded-2xl bg-cta flex items-center justify-center shrink-0">
            <CheckCircle2 size={32} strokeWidth={1.75} className="text-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="t-heading">Account submitted!</h2>
            <p className="t-body text-muted-foreground">
              The joint investment account <span className="t-body-semi text-foreground">{accountName}</span> has been submitted to a checker for approval.
            </p>
          </div>
          <div className="w-full bg-muted rounded-xl px-4 py-3.5 text-left">
            <span className="t-body-semi text-foreground block mb-1">What happens next?</span>
            <span className="t-body text-muted-foreground">A checker will review and approve the account. You'll be notified once all holders are verified and the account is active.</span>
          </div>
          <Button variant="primary" size="lg" className="w-full" onClick={onGoToAccounts}
            rightIcon={<ChevronRight size={15} strokeWidth={1.75} aria-hidden="true" />}>
            Go to Investment Accounts
          </Button>
        </div>
      </div>
    </>
  );
}
