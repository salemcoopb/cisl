import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Shield, User, Camera, FileText, Users, Landmark,
  CheckCircle2, XCircle, Loader2, Plus, Trash2,
  CreditCard, Smartphone, X, ChevronRight, AlertCircle,
  Lock, Search,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardHeader, CardBody } from "../ui/Card";
import { Alert } from "../ui/Alert";
import { Badge } from "../ui/Badge";
import { Toggle } from "../ui/Toggle";
import { StepperBar } from "./StepperBar";
import { useToast } from "../ui/Toast";
import { TableGrid, TableHead, TableBody, TableGridRow, Th, Td, TableEmpty } from "../ui/Table";
import { useSortable } from "../../lib/useSortable";
import type { Customer } from "../../data/customers";
import { customers as allCustomers, fullName } from "../../data/customers";

/* ─── Types ──────────────────────────────────────────────────────── */
interface NextOfKin {
  salutation: string; firstName: string; middleName: string;
  lastName: string; relationship: string; mobile: string; email: string;
}

interface BankWithdrawal {
  method: "bank";
  bankName: string; accountNumber: string; accountName: string;
  bankCode: string; swiftCode: string; branch: string; branchCode: string;
  addressLine1: string; city: string; country: string;
  postalAddress: string; postalCode: string;
  proofFile?: File | null;
  pesalinkVerified?: boolean;
}

interface MobileWithdrawal {
  method: "mobile";
  provider: string; phoneNumber: string; accountName: string;
  proofFile?: File | null;
}

type WithdrawalSlot = BankWithdrawal | MobileWithdrawal;

/* ─── Constants ──────────────────────────────────────────────────── */
const PRODUCTS = [
  {
    key: "bond",
    name: "Co-op Bond Fund",
    minDeposit: "KES 50,000",
    taxOnIncome: "15%",
    minCashOut: "KES 1,000",
    currency: "KES",
    description: "Invests in government and corporate bonds for steady income returns.",
  },
  {
    key: "mmf",
    name: "Co-op Money Market Fund",
    minDeposit: "KES 1,000",
    taxOnIncome: "15%",
    minCashOut: "KES 500",
    currency: "KES",
    description: "Highly liquid short-term fund suitable for emergency savings.",
  },
  {
    key: "gratuity",
    name: "Co-op Fixed Income Gratuity Fund",
    minDeposit: "KES 100,000",
    taxOnIncome: "10%",
    minCashOut: "KES 5,000",
    currency: "KES",
    description: "Long-term fixed income fund designed for gratuity and pension management.",
  },
];

const SALUTATIONS = ["", "Mr", "Mrs", "Ms", "Dr", "Prof"];
const RELATIONSHIPS = ["Spouse", "Child", "Parent", "Sibling", "Guardian", "Other"];
const SOURCE_OF_FUNDS = ["Salary", "Business", "Investment", "Inheritance", "Gift", "Other"];
const MONTHLY_TURNOVER = ["Below 50K", "50K–100K", "101K–200K", "201K–500K", "Above 500K"];
const BANKS = ["Co-operative Bank", "Equity Bank", "KCB Bank", "Standard Chartered", "NCBA Bank", "Absa Bank", "DTB Bank", "Other"];
const MOBILE_PROVIDERS = ["M-Pesa", "Airtel Money", "T-Kash"];

const STEPS_NEW = [
  { key: "personal",   label: "Basic"      },  // Basic info + verification
  { key: "details",    label: "Details"    },  // Full profile + next of kin
  { key: "compliance", label: "Compliance" },  // FATCA + PEP + tax exemption
  { key: "documents",  label: "Documents"  },  // ID capture + certified copies + signature
  { key: "account",    label: "Account"    },  // Product selection → setup reveals below
  { key: "review",     label: "Review"     },
];

const STEPS_EXISTING = [
  { key: "search",  label: "Find Customer" },
  { key: "account", label: "Account"       },
  { key: "review",  label: "Review"        },
];

/* ─── Shared form helpers ────────────────────────────────────────── */
function FormSelect({ label, value, options, onChange, required, placeholder }: {
  label: string; value: string; options: string[];
  onChange: (v: string) => void; required?: boolean; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="t-label text-foreground">
          {label}{required && <span className="text-danger-fg ml-0.5">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-md border border-border bg-background px-3.5 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function FileUploadField({ label, file, onFile, accept = ".pdf,.jpg,.jpeg,.png", hint }: {
  label: string; file: File | null | undefined;
  onFile: (f: File | null) => void; accept?: string; hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="t-label text-foreground">{label}</span>
      {file ? (
        <div className="flex items-center gap-2.5 bg-success-bg border border-success-fg/20 rounded-md px-3 py-2.5">
          <FileText size={14} strokeWidth={1.75} className="text-success-fg shrink-0" aria-hidden="true" />
          <span className="t-caption text-foreground truncate flex-1">{file.name}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFile(null); }}
            className="shrink-0 text-muted-foreground hover:text-danger-fg"
            aria-label="Remove file"
          >
            <X size={13} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); ref.current?.click(); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ref.current?.click(); } }}
            className="flex items-center justify-center gap-2 border border-dashed border-border rounded-lg py-3.5 cursor-pointer hover:border-cta hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta"
          >
            <Plus size={14} strokeWidth={2} className="text-muted-foreground" aria-hidden="true" />
            <span className="t-body text-muted-foreground">Upload file</span>
            {hint && <span className="t-caption text-muted-foreground">({hint})</span>}
          </div>
          <input
            ref={ref}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.[0]) onFile(e.target.files[0]);
              e.target.value = "";
            }}
          />
        </>
      )}
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="t-label text-foreground">{label}</label>
      <div className="flex items-center h-11 rounded-md border border-border bg-muted px-3.5 cursor-not-allowed">
        <span className="t-body text-muted-foreground select-none truncate">{value ?? "—"}</span>
      </div>
    </div>
  );
}

function SectionCard({ icon, title, children, cols = 2 }: {
  icon: React.ReactNode; title: string; children: React.ReactNode; cols?: 2 | 3 | 4;
}) {
  const g = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" }[cols];
  return (
    <Card>
      <CardHeader icon={icon} title={title} />
      <div className={`px-5 py-5 grid gap-x-8 gap-y-5 ${g}`}>{children}</div>
    </Card>
  );
}

function BookmarkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

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
            <Button variant="ghost" size="md" onClick={onSaveDraft}
              leftIcon={<BookmarkIcon />}>
              Save as draft
            </Button>
          )}
          <div>{primaryButton}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── WithdrawalSlotEditor ───────────────────────────────────────── */
const COOP_BANK = "Co-operative Bank";

function WithdrawalSlotEditor({ label, slot, onChange, validating, onValidate }: {
  label: "Primary" | "Secondary";
  slot: WithdrawalSlot;
  onChange: (s: WithdrawalSlot) => void;
  validating: boolean;
  onValidate: () => void;
}) {
  const isBank   = slot.method === "bank";
  const isCoop   = isBank && (slot as BankWithdrawal).bankName === COOP_BANK;
  const b        = slot as BankWithdrawal;
  const m        = slot as MobileWithdrawal;
  const set      = (field: string, val: unknown) => onChange({ ...slot, [field]: val } as WithdrawalSlot);

  return (
    <div className="flex flex-col gap-5">
      {/* Method + label */}
      <div className="flex items-center gap-3">
        <span className={`t-label px-2.5 py-1 rounded-sm ${label === "Primary" ? "bg-primary/10 text-primary" : "bg-panel text-muted-foreground"}`}>
          {label}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ method: "bank", bankName: "", accountNumber: "", accountName: "", bankCode: "", swiftCode: "", branch: "", branchCode: "", addressLine1: "", city: "", country: "", postalAddress: "", postalCode: "", proofFile: null, pesalinkVerified: false })}
            className={`flex items-center gap-2 px-3 h-9 rounded-md border t-body transition-colors ${isBank ? "border-cta bg-cta/5 text-cta font-semibold" : "border-border text-muted-foreground hover:border-cta/40"}`}
          >
            <CreditCard size={14} strokeWidth={1.75} aria-hidden="true" /> Bank Transfer
          </button>
          <button
            onClick={() => onChange({ method: "mobile", provider: "", phoneNumber: "", accountName: "", proofFile: null })}
            className={`flex items-center gap-2 px-3 h-9 rounded-md border t-body transition-colors ${!isBank ? "border-cta bg-cta/5 text-cta font-semibold" : "border-border text-muted-foreground hover:border-cta/40"}`}
          >
            <Smartphone size={14} strokeWidth={1.75} aria-hidden="true" /> Mobile Money
          </button>
        </div>
      </div>

      {isBank ? (
        <div className="flex flex-col gap-5">
          {/* Bank name — co-op gets special treatment */}
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
              id={`account-number-${label.toLowerCase()}`}
              onChange={(e) => onChange({ ...slot, accountNumber: e.target.value, pesalinkVerified: false } as WithdrawalSlot)}
              placeholder="Enter account number"
            />
          </div>

          {/* Co-op Bank: validate to autofill. Other banks: manual fields + PesaLink */}
          {b.bankName && (
            isCoop ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <Button variant="secondary" size="md" loading={validating}
                    disabled={!b.accountNumber.trim()} onClick={onValidate}>
                    Validate account
                  </Button>
                  {b.pesalinkVerified && (
                    <div className="flex items-center gap-2 text-success-fg">
                      <CheckCircle2 size={14} strokeWidth={1.75} aria-hidden="true" />
                      <span className="t-body-semi">Account verified</span>
                    </div>
                  )}
                </div>
                {b.pesalinkVerified && (
                  <div className="grid grid-cols-3 gap-x-8 gap-y-4 p-4 rounded-lg bg-success-bg border border-success-fg/20">
                    <ReviewField label="Account Name" value={b.accountName} />
                    <ReviewField label="Branch"       value={b.branch} />
                    <ReviewField label="Branch Code"  value={b.branchCode} />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-4 gap-x-8 gap-y-5">
                  <Input label="Account Name"   id={`${label}-account-name`}   value={b.accountName}   onChange={(e) => set("accountName",  e.target.value)} />
                  <Input label="Bank Code"      id={`${label}-bank-code`}      value={b.bankCode}      onChange={(e) => set("bankCode",     e.target.value)} />
                  <Input label="SWIFT Code"     id={`${label}-swift-code`}     value={b.swiftCode}     onChange={(e) => set("swiftCode",    e.target.value)} />
                  <Input label="Branch"         id={`${label}-branch`}         value={b.branch}        onChange={(e) => set("branch",       e.target.value)} />
                  <Input label="Branch Code"    id={`${label}-branch-code`}    value={b.branchCode}    onChange={(e) => set("branchCode",   e.target.value)} />
                  <Input label="Address Line 1" id={`${label}-address-line-1`} value={b.addressLine1}  onChange={(e) => set("addressLine1", e.target.value)} />
                  <Input label="City"           id={`${label}-city`}           value={b.city}          onChange={(e) => set("city",         e.target.value)} />
                  <Input label="Country"        id={`${label}-country`}        value={b.country}       onChange={(e) => set("country",      e.target.value)} />
                  <Input label="Postal Address" id={`${label}-postal-address`} value={b.postalAddress} onChange={(e) => set("postalAddress",e.target.value)} />
                  <Input label="Postal Code"    id={`${label}-postal-code`}    value={b.postalCode}    onChange={(e) => set("postalCode",   e.target.value)} />
                </div>
                {/* PesaLink verification for non-coop banks */}
                <div className="flex items-center gap-2.5">
                  <Button variant="secondary" size="md" loading={validating}
                    disabled={!b.accountNumber.trim() || !b.bankName} onClick={onValidate}>
                    Verify via PesaLink
                  </Button>
                  {b.pesalinkVerified && (
                    <div className="flex items-center gap-2 text-success-fg">
                      <CheckCircle2 size={14} strokeWidth={1.75} aria-hidden="true" />
                      <span className="t-body-semi">PesaLink verified</span>
                    </div>
                  )}
                </div>
                {b.pesalinkVerified && (
                  <FileUploadField
                    label="Proof of Ownership *"
                    file={b.proofFile ?? null}
                    onFile={(f) => set("proofFile", f)}
                    hint="Bank statement or ownership document"
                  />
                )}
              </div>
            )
          )}
        </div>
      ) : (
        /* Mobile money */
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-x-8 gap-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="t-label text-foreground">Provider</label>
              <select value={m.provider} onChange={(e) => set("provider", e.target.value)}
                className="h-11 rounded-md border border-border bg-background px-3.5 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors">
                <option value="">Select provider…</option>
                {MOBILE_PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <Input label="Phone Number" id={`${label}-phone`} value={m.phoneNumber} placeholder="+254 7xx xxx xxx"
              onChange={(e) => set("phoneNumber", e.target.value)} />
            <Input label="Account Name" id={`${label}-mobile-account-name`} value={m.accountName}
              onChange={(e) => set("accountName", e.target.value)} />
          </div>
          <FileUploadField
            label="Proof of Ownership"
            file={m.proofFile ?? null}
            onFile={(f) => set("proofFile", f)}
            hint="Statement or any proof of ownership"
          />
        </div>
      )}
    </div>
  );
}

/* ─── Search step component (hooks must live at component level) ─── */
const CUST_COLS = "2fr 1.4fr 1.8fr 1.4fr 1fr 120px";

function SearchStep({ customerSearch, onSearchChange, onSelect }: {
  customerSearch: string;
  onSearchChange: (v: string) => void;
  onSelect: (c: Customer) => void;
}) {
  const filtered = (() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return allCustomers;
    return allCustomers.filter((c) =>
      `${fullName(c)} ${c.cifId} ${c.idNumber} ${c.email}`.toLowerCase().includes(q)
    );
  })();

  const { sorted, sortKey, sortDir, toggleSort } = useSortable(
    filtered as unknown as Record<string, unknown>[],
    "lastName"
  );

  return (
    <StepShell
      title="Find Customer"
      description="Search for an existing customer then click Add Account to proceed."
      backButton={<div />}
      primaryButton={<div />}
    >
      <Input
        placeholder="Search by name, CIF, ID number, or email"
        value={customerSearch}
        onChange={(e) => onSearchChange(e.target.value)}
        leftSlot={<Search size={16} strokeWidth={1.75} aria-hidden="true" />}
      />
      <TableGrid>
        <TableHead>
          <TableGridRow cols={CUST_COLS} head>
            <Th sort={sortKey === "firstName" ? sortDir : null} onSort={() => toggleSort("firstName")}>Customer</Th>
            <Th>Identification</Th>
            <Th sort={sortKey === "emailMasked" ? sortDir : null} onSort={() => toggleSort("emailMasked")}>Email</Th>
            <Th>Phone</Th>
            <Th sort={sortKey === "dateOnboarded" ? sortDir : null} onSort={() => toggleSort("dateOnboarded")}>Onboarded</Th>
            <Th />
          </TableGridRow>
        </TableHead>
        <TableBody>
          {sorted.length === 0 ? (
            <TableEmpty>No customers match your search.</TableEmpty>
          ) : (sorted as unknown as Customer[]).map((c) => (
            <TableGridRow key={c.cifId} cols={CUST_COLS}>
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
                <Button variant="primary" size="sm" onClick={() => onSelect(c)}>
                  Add Account
                </Button>
              </div>
            </TableGridRow>
          ))}
        </TableBody>
      </TableGrid>
      <span className="t-body text-muted-foreground">
        Showing {sorted.length} of {allCustomers.length} customers
      </span>
    </StepShell>
  );
}

/* ─── Main journey component ─────────────────────────────────────── */
export function IndividualJourney({ existingCustomer, isNewCustomer = true }: {
  existingCustomer?: Customer;
  isNewCustomer?: boolean;
}) {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? {}) as Record<string, unknown>;
  const jointReturn = !!locationState.jointReturn;

  // Step routing — if existing customer provided, skip customer creation
  const isExisting = !!existingCustomer;
  const [step, setStep] = useState<number>(0);

  const steps = isNewCustomer ? STEPS_NEW : STEPS_EXISTING;

  // ── Customer state (new flow) ──
  const [usCitizen, setUsCitizen] = useState(false);
  // FATCA indicia checkboxes — all unchecked by default
  const [fatcaIndicia, setFatcaIndicia] = useState({
    usCitizenOrResident: false,
    bornInUS:            false,
    usAddress:           false,
    usPhone:             false,
    standingTransfer:    false,
  });
  const [fatcaTin, setFatcaTin]         = useState("");
  const [fatcaComment, setFatcaComment] = useState("");
  const anyFatcaIndicia = Object.values(fatcaIndicia).some(Boolean);

  // PEP declarations
  const [pepPolitical,  setPepPolitical]  = useState<boolean | null>(null);
  const [pepPublicOffice, setPepPublicOffice] = useState<boolean | null>(null);
  const [pepPosition,   setPepPosition]   = useState<boolean | null>(null);
  const [pepDetails,    setPepDetails]    = useState("");
  const isPep = pepPolitical === true || pepPublicOffice === true || pepPosition === true;
  const pepComplete = pepPolitical !== null && pepPublicOffice !== null && pepPosition !== null;

  // Additional documents
  const [isForeigner,    setIsForeigner]    = useState(false);
  const [idCopyStamped,  setIdCopyStamped]  = useState<File | null>(null);
  const [kraCopyStamped, setKraCopyStamped] = useState<File | null>(null);
  const [workPermit,     setWorkPermit]     = useState<File | null>(null);
  const [passport,       setPassport]       = useState<File | null>(null);
  const [signaturePhoto, setSignaturePhoto] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [kraPin, setKraPin] = useState("");

  // Verification (IPRS, Sanction, Blacklist)
  const [verifying, setVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState<{
    iprs?: "success" | "fail" | "unavailable";
    sanction?: "success" | "fail" | "unavailable";
    blacklist?: "success" | "fail" | "unavailable";
  } | null>(null);

  // Documents
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [facePhoto, setFacePhoto] = useState<File | null>(null);
  const [faceVerifying, setFaceVerifying] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);

  // Full details
  const [salutation, setSalutation] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [countryOfResidence, setCountryOfResidence] = useState("");
  const [email, setEmail] = useState("");
  const [altEmail, setAltEmail] = useState("");
  const [emailComment, setEmailComment] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [postalAddress, setPostalAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [monthlyTurnover, setMonthlyTurnover] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState("");

  // Next of kin
  const [nextOfKin, setNextOfKin] = useState<NextOfKin[]>([{
    salutation: "", firstName: "", middleName: "", lastName: "",
    relationship: "", mobile: "", email: "",
  }]);

  // Tax exemption
  const [taxExempt, setTaxExempt] = useState(false);
  const [taxCertNo, setTaxCertNo] = useState("");
  const [taxIssueDate, setTaxIssueDate] = useState("");
  const [taxExpiryDate, setTaxExpiryDate] = useState("");
  const [taxDoc, setTaxDoc] = useState<File | null>(null);

  // ── Existing customer search ──
  const [customerSearch, setCustomerSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(existingCustomer);

  // ── Account selection ──
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [accountName, setAccountName] = useState("");
  const [aroUsername, setAroUsername] = useState("");
  const [aroCode, setAroCode] = useState("");
  const [fetchingAro, setFetchingAro] = useState(false);

  // ── Withdrawal setup ──
  const [primaryWithdrawal, setPrimaryWithdrawal] = useState<WithdrawalSlot>({
    method: "bank",
    bankName: "", accountNumber: "", accountName: "",
    bankCode: "", swiftCode: "", branch: "", branchCode: "",
    addressLine1: "", city: "", country: "", postalAddress: "", postalCode: "",
    proofFile: null, pesalinkVerified: false,
  });
  const [hasSecondary, setHasSecondary] = useState(false);
  const [secondaryWithdrawal, setSecondaryWithdrawal] = useState<WithdrawalSlot>({
    method: "mobile",
    provider: "", phoneNumber: "", accountName: "", proofFile: null,
  });

  const [validatingPrimary, setValidatingPrimary] = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [showSuccess, setShowSuccess]     = useState(false);

  const currentStepKey = steps[step]?.key;

  /* ─── Handlers ─────────────────────────────────────────────────── */
  function next() { setStep((s) => s + 1); }
  function back() { setStep((s) => Math.max(0, s - 1)); }

  function runVerification() {
    setVerifying(true);
    setVerificationResults(null);
    setTimeout(() => {
      setVerifying(false);
      setVerificationResults({
        iprs: "success",
        sanction: "success",
        blacklist: "success",
      });
    }, 1800);
  }

  function runFaceVerification() {
    setFaceVerifying(true);
    setFaceVerified(false);
    setTimeout(() => {
      setFaceVerifying(false);
      setFaceVerified(true);
    }, 1500);
  }

  function handleCustomerSearch() {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return;
    const results = allCustomers.filter((c) =>
      fullName(c).toLowerCase().includes(q) ||
      c.cifId.includes(q) ||
      c.idNumber.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
    setSearchResults(results);
  }

  function selectCustomer(c: Customer) {
    setSelectedCustomer(c);
    next();
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
    if (slot.bankName !== "Co-operative Bank") return;
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

  function handleSubmit() {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setShowSuccess(true);
    }, 1200);
  }

  function handleSaveDraft() {
    toast({
      variant: "success",
      title: "Draft saved",
      description: `Progress saved. You can resume this from the Drafts tab on the Customers page.`,
    });
    navigate("/customers");
  }

  const allVerified =
    verificationResults?.iprs === "success" &&
    verificationResults?.sanction === "success" &&
    verificationResults?.blacklist === "success";

  /* ─── Stepper header ────────────────────────────────────────────── */
  return (
    <div>
      <StepperBar steps={steps} current={step} />

      {/* ══════════════════════════════════════════════════════════════
          STEP: FIND CUSTOMER (existing customer path)
      ══════════════════════════════════════════════════════════════ */}
      {currentStepKey === "search" && (
        <SearchStep
          customerSearch={customerSearch}
          onSearchChange={setCustomerSearch}
          onSelect={(c) => { setSelectedCustomer(c); next(); }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP: PERSONAL INFO + VERIFICATION
      ══════════════════════════════════════════════════════════════ */}
      {currentStepKey === "personal" && (
        <StepShell
          title="Personal Information"
          description="Enter the customer's basic details and run identity checks."
          backButton={<Button variant="ghost" onClick={back}>Back</Button>}
          primaryButton={<Button variant="primary" onClick={next} disabled={!allVerified}>
                Continue
              </Button>}
          onSaveDraft={handleSaveDraft}
        >
          {/* ── Personal Info + Verification ── */}
          <SectionCard icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Personal Information" cols={3}>
            <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input label="Middle Name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
            <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            <FormSelect label="ID Type" value={idType} options={["National ID", "Passport", "Military ID"]} onChange={setIdType} required placeholder="Select…" />
            <Input label="ID Number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required />
            <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7xx xxx xxx" required />
            <Input label="KRA PIN" value={kraPin} onChange={(e) => setKraPin(e.target.value)} placeholder="e.g. A001423266Z" />
          </SectionCard>

          <Card>
            <CardHeader icon={<Shield size={15} strokeWidth={2} aria-hidden="true" />} title="Identity Verification" />
            <div className="px-5 py-5 flex flex-col gap-4">
              {!verificationResults && !verifying && (
                <div className="flex items-center justify-between">
                  <p className="t-body text-muted-foreground">Run IPRS, Sanctions, and Blacklist checks against the details provided.</p>
                  <Button variant="primary" size="md"
                    disabled={!firstName || !lastName || !idType || !idNumber}
                    onClick={runVerification}>Run checks</Button>
                </div>
              )}
              {verifying && (
                <div className="flex items-center gap-3 py-2">
                  <Loader2 size={16} strokeWidth={1.75} className="animate-spin text-cta" aria-hidden="true" />
                  <span className="t-body text-muted-foreground">Running identity checks…</span>
                </div>
              )}
              {verificationResults && (
                <div className="flex flex-col gap-3">
                  {(["iprs", "sanction", "blacklist"] as const).map((check) => {
                    const result = verificationResults[check];
                    const labels = { iprs: "IPRS Check", sanction: "Sanctions Check", blacklist: "Blacklist Check" };
                    return (
                      <div key={check} className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted">
                        <span className="t-body-med">{labels[check]}</span>
                        {result === "success" && <div className="flex items-center gap-2 text-success-fg"><CheckCircle2 size={15} strokeWidth={1.75} aria-hidden="true" /><span className="t-body-semi">Passed</span></div>}
                        {result === "fail" && <div className="flex items-center gap-2 text-danger-fg"><XCircle size={15} strokeWidth={1.75} aria-hidden="true" /><span className="t-body-semi">Failed</span></div>}
                        {result === "unavailable" && <div className="flex items-center gap-2 text-warn-fg"><AlertCircle size={15} strokeWidth={1.75} aria-hidden="true" /><span className="t-body-semi">Service unavailable</span></div>}
                      </div>
                    );
                  })}
                  {allVerified
                    ? <Alert variant="success">All checks passed. You may proceed.</Alert>
                    : <Alert variant="danger">One or more checks did not pass. Review before proceeding.</Alert>}
                </div>
              )}
            </div>
          </Card>


        </StepShell>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP: DOCUMENTS
      ══════════════════════════════════════════════════════════════ */}
      {currentStepKey === "documents" && (
        <StepShell
          title="Identity Documents"
          description="Upload ID photos for verification, supporting documents, and the customer's signature."
          backButton={<Button variant="ghost" onClick={back}>Back</Button>}
          primaryButton={<Button variant="primary" onClick={next}
            disabled={!idFront || !idBack || !idCopyStamped || !kraCopyStamped || !signaturePhoto
              || (isForeigner && (!workPermit || !passport))}>
            Continue
          </Button>}
          onSaveDraft={handleSaveDraft}
        >
          {/* Citizen/Foreigner toggle */}
          <Card>
            <CardHeader icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Customer Nationality" />
            <div className="px-5 py-5">
              <Toggle
                checked={isForeigner}
                onChange={setIsForeigner}
                label="This is a foreign national"
                description="Additional documents (work permit and valid passport) will be required."
              />
            </div>
          </Card>

          {/* ID Capture — for face verification */}
          <Card>
            <CardHeader icon={<Camera size={15} strokeWidth={2} aria-hidden="true" />} title="ID Capture" />
            <div className="px-5 py-5 flex flex-col gap-5">
              <p className="t-body text-muted-foreground">
                Take or upload a clear photo of both sides of the customer's ID. These are used for automated identity verification.
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <FileUploadField label="ID Front Photo *" file={idFront} onFile={setIdFront} hint="JPG, PNG" accept=".jpg,.jpeg,.png" />
                <FileUploadField label="ID Back Photo *"  file={idBack}  onFile={setIdBack}  hint="JPG, PNG" accept=".jpg,.jpeg,.png" />
              </div>
              {/* Face verification */}
              <div className="pt-4 border-t border-border flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="t-body-semi">Face Verification</p>
                    <p className="t-caption text-muted-foreground">Upload a clear, front-facing photo to match against the ID above.</p>
                  </div>
                  <span className="t-label text-muted-foreground">Optional</span>
                </div>
                <FileUploadField label="Customer Face Photo" file={facePhoto}
                  onFile={(f) => { setFacePhoto(f); setFaceVerified(false); }} hint="JPG, PNG — clear, well-lit" accept=".jpg,.jpeg,.png" />
                {facePhoto && !faceVerified && (
                  <Button variant="secondary" size="md" loading={faceVerifying} onClick={runFaceVerification}
                    leftIcon={<Camera size={15} strokeWidth={1.75} aria-hidden="true" />}>
                    {faceVerifying ? "Verifying…" : "Verify against ID"}
                  </Button>
                )}
                {faceVerified && <Alert variant="success">Face verification passed. Photo matches the uploaded ID.</Alert>}
                {!facePhoto && <p className="t-caption text-muted-foreground">You can skip this and complete face verification later.</p>}
              </div>
            </div>
          </Card>

          {/* Certified copies — for compliance records */}
          <Card>
            <CardHeader icon={<FileText size={15} strokeWidth={2} aria-hidden="true" />} title="Certified Copies" />
            <div className="px-5 py-5 flex flex-col gap-5">
              <p className="t-body text-muted-foreground">
                Upload scanned copies that have been stamped and certified as true copies by the branch officer.
              </p>
              <div className={`grid gap-x-8 gap-y-5 ${isForeigner ? "grid-cols-2" : "grid-cols-2"}`}>
                <FileUploadField label="ID Copy (CISL Stamped) *"  file={idCopyStamped}  onFile={setIdCopyStamped}  hint="PDF, JPG, PNG" />
                <FileUploadField label="KRA Copy (CISL Stamped) *" file={kraCopyStamped} onFile={setKraCopyStamped} hint="PDF, JPG, PNG" />
                {isForeigner && (
                  <>
                    <FileUploadField label="Work Permit *"   file={workPermit} onFile={setWorkPermit} hint="PDF, JPG, PNG" />
                    <FileUploadField label="Valid Passport *" file={passport}  onFile={setPassport}   hint="PDF, JPG, PNG" />
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Signature */}
          <Card>
            <CardHeader icon={<FileText size={15} strokeWidth={2} aria-hidden="true" />} title="Customer Signature" />
            <div className="px-5 py-5 flex flex-col gap-3">
              <p className="t-body text-muted-foreground">
                Upload a photo or scan of the customer's handwritten signature on a plain white background.
              </p>
              <div className="max-w-sm">
                <FileUploadField label="Signature Photo *" file={signaturePhoto} onFile={setSignaturePhoto} hint="JPG, PNG" accept=".jpg,.jpeg,.png" />
              </div>
            </div>
          </Card>

        </StepShell>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP: DETAILS + NEXT OF KIN
      ══════════════════════════════════════════════════════════════ */}
      {currentStepKey === "details" && (
        <StepShell
          title="Customer Details"
          description="Complete the customer profile and add next of kin."
          backButton={<Button variant="ghost" onClick={back}>Back</Button>}
          primaryButton={<Button variant="primary" onClick={next}
            disabled={!email || !occupation || !physicalAddress || !city}>
            Continue
          </Button>}
          onSaveDraft={handleSaveDraft}
        >
          <Alert variant="info" title="Pre-filled from verification">
            Fields shown in grey were captured and verified in the previous step and cannot be changed here.
          </Alert>
          <SectionCard icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Personal Information" cols={4}>
            <FormSelect label="Salutation" value={salutation} options={SALUTATIONS.filter(Boolean)} onChange={setSalutation} placeholder="Select…" />
            <ReadonlyField label="First Name" value={firstName} />
            <ReadonlyField label="Middle Name" value={middleName || "—"} />
            <ReadonlyField label="Last Name" value={lastName} />
            <Input label="Date of Birth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
            <FormSelect label="Gender" value={gender} options={["Male", "Female", "Other"]} onChange={setGender} placeholder="Select…" required />
            <Input label="Nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="e.g. Kenyan" required />
            <Input label="Country of Residence" value={countryOfResidence} onChange={(e) => setCountryOfResidence(e.target.value)} placeholder="e.g. Kenya" required />
          </SectionCard>

          <SectionCard icon={<FileText size={15} strokeWidth={2} aria-hidden="true" />} title="Contact Details" cols={4}>
            <Input label="Email *" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            <Input label="Alt. Email" value={altEmail} onChange={(e) => setAltEmail(e.target.value)} type="email" />
            <div className="col-span-2">
              <div className="flex flex-col gap-1.5">
                <label className="t-label text-foreground">Email Comment</label>
                <input value={emailComment} onChange={(e) => setEmailComment(e.target.value)}
                  className="h-11 rounded-md border border-border bg-background px-3.5 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors"
                  placeholder="Optional note about this email address" />
              </div>
            </div>
            <ReadonlyField label="Phone Number" value={phone} />
            <Input label="Alt. Phone" value={altPhone} onChange={(e) => setAltPhone(e.target.value)} />
            <Input label="Postal Address" value={postalAddress} onChange={(e) => setPostalAddress(e.target.value)} />
            <Input label="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            <div className="col-span-2">
              <Input label="Physical Address *" value={physicalAddress} onChange={(e) => setPhysicalAddress(e.target.value)} required />
            </div>
            <Input label="City *" value={city} onChange={(e) => setCity(e.target.value)} required />
          </SectionCard>

          <SectionCard icon={<Landmark size={15} strokeWidth={2} aria-hidden="true" />} title="Employment & Financial Details" cols={3}>
            <Input label="Occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} required />
            <FormSelect label="Monthly Turnover" value={monthlyTurnover} options={MONTHLY_TURNOVER} onChange={setMonthlyTurnover} placeholder="Select…" />
            <FormSelect label="Source of Funds" value={sourceOfFunds} options={SOURCE_OF_FUNDS} onChange={setSourceOfFunds} placeholder="Select…" />
          </SectionCard>

          {/* ── Next of Kin ── */}
          {nextOfKin.map((kin, idx) => (
            <Card key={idx}>
              <CardHeader
                icon={<Users size={15} strokeWidth={2} aria-hidden="true" />}
                title={`Next of Kin ${nextOfKin.length > 1 ? idx + 1 : ""}`}
                action={
                  nextOfKin.length > 1 ? (
                    <button
                      onClick={() => setNextOfKin((p) => p.filter((_, i) => i !== idx))}
                      className="text-danger-fg hover:text-danger-fg/80 t-caption flex items-center gap-1"
                      aria-label="Remove"
                    >
                      <Trash2 size={13} strokeWidth={1.75} aria-hidden="true" /> Remove
                    </button>
                  ) : undefined
                }
              />
              <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-5">
                <FormSelect
                  label="Salutation"
                  value={kin.salutation}
                  options={SALUTATIONS.filter(Boolean)}
                  onChange={(v) => setNextOfKin((p) => p.map((k, i) => i === idx ? { ...k, salutation: v } : k))}
                  placeholder="Select…"
                />
                <Input label="First Name" value={kin.firstName} required
                  onChange={(e) => setNextOfKin((p) => p.map((k, i) => i === idx ? { ...k, firstName: e.target.value } : k))} />
                <Input label="Middle Name" value={kin.middleName}
                  onChange={(e) => setNextOfKin((p) => p.map((k, i) => i === idx ? { ...k, middleName: e.target.value } : k))} />
                <Input label="Last Name" value={kin.lastName} required
                  onChange={(e) => setNextOfKin((p) => p.map((k, i) => i === idx ? { ...k, lastName: e.target.value } : k))} />
                <FormSelect
                  label="Relationship"
                  value={kin.relationship}
                  options={RELATIONSHIPS}
                  onChange={(v) => setNextOfKin((p) => p.map((k, i) => i === idx ? { ...k, relationship: v } : k))}
                  placeholder="Select…"
                  required
                />
                <Input label="Mobile Number" value={kin.mobile} placeholder="+254 7xx xxx xxx"
                  onChange={(e) => setNextOfKin((p) => p.map((k, i) => i === idx ? { ...k, mobile: e.target.value } : k))} />
                <Input label="Email Address" value={kin.email} type="email"
                  onChange={(e) => setNextOfKin((p) => p.map((k, i) => i === idx ? { ...k, email: e.target.value } : k))} />
              </div>
            </Card>
          ))}
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Plus size={15} strokeWidth={1.75} aria-hidden="true" />}
            onClick={() => setNextOfKin((p) => [...p, { salutation: "", firstName: "", middleName: "", lastName: "", relationship: "", mobile: "", email: "" }])}
          >
            Add another next of kin
          </Button>

        </StepShell>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP: COMPLIANCE  (FATCA + Tax Exemption)
      ══════════════════════════════════════════════════════════════ */}
      {currentStepKey === "compliance" && (
        <StepShell
          title="Compliance"
          description="Complete FATCA declaration, PEP questions, and tax exemption status."
          backButton={<Button variant="ghost" onClick={back}>Back</Button>}
          primaryButton={<Button variant="primary" onClick={next}
                disabled={(anyFatcaIndicia && !fatcaTin.trim()) || !pepComplete || (isPep && !pepDetails.trim()) || (taxExempt && (!taxCertNo || !taxIssueDate || !taxExpiryDate || !taxDoc))}>
                Continue
              </Button>}
          onSaveDraft={handleSaveDraft}
        >
          {/* ── FATCA ── */}
          <Card>
            <CardHeader
              icon={<Shield size={15} strokeWidth={2} aria-hidden="true" />}
              title="FATCA Declaration"
            />
            <div className="px-5 py-5 flex flex-col gap-5">
              <p className="t-body text-muted-foreground">
                Check any of the following that apply to the customer. If any box is checked, a U.S. Tax Identification Number (TIN) will be required.
              </p>

              {/* Indicia checkboxes */}
              <div className="flex flex-col gap-0">
                {([
                  { key: "usCitizenOrResident", label: "U.S. Citizen or Tax Resident" },
                  { key: "bornInUS",            label: "Born in the United States" },
                  { key: "usAddress",           label: "Has U.S. residential or mailing address" },
                  { key: "usPhone",             label: "Has U.S. telephone number" },
                  { key: "standingTransfer",    label: "Standing instructions to transfer funds to U.S. accounts" },
                ] as { key: keyof typeof fatcaIndicia; label: string }[]).map((item, i, arr) => (
                  <label
                    key={item.key}
                    className={`flex items-center gap-3.5 px-4 py-3.5 cursor-pointer hover:bg-muted/40 transition-colors ${i < arr.length - 1 ? "border-b border-border-light" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={fatcaIndicia[item.key]}
                      onChange={(e) => setFatcaIndicia((p) => ({ ...p, [item.key]: e.target.checked }))}
                      className="accent-cta w-4 h-4 shrink-0"
                    />
                    <span className="t-body text-foreground">{item.label}</span>
                  </label>
                ))}
              </div>

              {/* Separator + comment field always visible */}
              <div className="pt-2 border-t border-border flex flex-col gap-1.5">
                <label className="t-label text-foreground">
                  Additional FATCA Information <span className="t-caption text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  value={fatcaComment}
                  onChange={(e) => setFatcaComment(e.target.value)}
                  rows={3}
                  placeholder="Add any additional relevant information…"
                  className="w-full rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none"
                />
              </div>

              {/* TIN required — shows when any indicia is checked */}
              {anyFatcaIndicia && (
                <div className="flex flex-col gap-3">
                  <Alert variant="warn" title="U.S. Tax Identification Required">
                    This customer has U.S. indicia. A Tax Identification Number (TIN) is required for U.S. tax reporting.
                  </Alert>
                  <Alert variant="info" title="Tax Identification Number (TIN)">
                    If a customer has any U.S. indicia, they will need to provide a Tax Identification Number (TIN). For U.S. citizens and residents, this is typically the Social Security Number (SSN).
                  </Alert>
                  <Input
                    label="U.S. Tax Identification Number (TIN) *"
                    value={fatcaTin}
                    onChange={(e) => setFatcaTin(e.target.value)}
                    placeholder="e.g. 123-45-6789"
                  />
                </div>
              )}
            </div>
          </Card>


          {/* ── PEP Questions ── */}
          <Card>
            <CardHeader icon={<Users size={15} strokeWidth={2} aria-hidden="true" />} title="Politically Exposed Person (PEP) Declaration" />
            <div className="px-5 py-5 flex flex-col gap-5">
              <p className="t-body text-muted-foreground">
                A Politically Exposed Person (PEP) is someone who holds or has held a prominent public position. Answer all three questions honestly.
              </p>
              {([
                { key: "pepPolitical",   state: pepPolitical,   setter: setPepPolitical,   label: "Are you affiliated with any political party?" },
                { key: "pepPublicOffice",state: pepPublicOffice, setter: setPepPublicOffice,label: "Have you ever held any public office, or are you related to anyone who holds or has held public office?" },
                { key: "pepPosition",    state: pepPosition,    setter: setPepPosition,    label: "Have you ever held any political position, or are you related to anyone who is or has been in a political party?" },
              ] as { key: string; state: boolean | null; setter: (v: boolean) => void; label: string }[]).map((q, i, arr) => (
                <div key={q.key} className={`flex flex-col gap-3 ${i > 0 ? "pt-4 border-t border-border-light" : ""}`}>
                  <p className="t-body-semi text-foreground">{q.label}</p>
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => q.setter(true)}
                      className={`flex items-center gap-2 px-4 h-9 rounded-md border t-body transition-colors ${q.state === true ? "border-cta bg-cta/5 text-cta font-semibold" : "border-border text-muted-foreground hover:border-cta/40"}`}>
                      Yes
                    </button>
                    <button type="button"
                      onClick={() => q.setter(false)}
                      className={`flex items-center gap-2 px-4 h-9 rounded-md border t-body transition-colors ${q.state === false ? "border-cta bg-cta/5 text-cta font-semibold" : "border-border text-muted-foreground hover:border-cta/40"}`}>
                      No
                    </button>
                  </div>
                </div>
              ))}
              {isPep && (
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <Alert variant="warn" title="Enhanced due diligence required">
                    This customer is a Politically Exposed Person. Additional scrutiny and approval may be required.
                  </Alert>
                  <label className="t-label text-foreground mt-2">PEP Details <span className="text-danger-fg">*</span></label>
                  <textarea
                    value={pepDetails}
                    onChange={(e) => setPepDetails(e.target.value)}
                    rows={3}
                    placeholder="Describe the political affiliation, office, or position held…"
                    className="w-full rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* ── Tax Exemption ── */}
          <Card>
            <CardHeader icon={<Shield size={15} strokeWidth={2} aria-hidden="true" />} title="Tax Exemption Status" />
            <div className="px-5 py-5 flex flex-col gap-5">
              <Toggle
                checked={taxExempt}
                onChange={setTaxExempt}
                label="Customer is exempt from withholding tax"
                description="Only check if a valid KRA exemption certificate is available."
              />
              {taxExempt && (
                <div className="grid grid-cols-3 gap-x-8 gap-y-5 pt-2">
                  <Input label="Certificate Number *" value={taxCertNo} onChange={(e) => setTaxCertNo(e.target.value)} placeholder="e.g. KRA/EX/2024/0148" />
                  <Input label="Issue Date *" type="date" value={taxIssueDate} onChange={(e) => setTaxIssueDate(e.target.value)} />
                  <Input label="Expiry Date *" type="date" value={taxExpiryDate} onChange={(e) => setTaxExpiryDate(e.target.value)} />
                  <div className="col-span-3">
                    <FileUploadField label="Upload Certificate *" file={taxDoc} onFile={setTaxDoc} hint="PDF, JPG, PNG" />
                  </div>
                </div>
              )}
              {!taxExempt && (
                <Alert variant="info">No tax exemption. Standard withholding tax rates will apply to this customer's investment income.</Alert>
              )}
            </div>
          </Card>

        </StepShell>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP: ACCOUNT — product selection + setup
      ══════════════════════════════════════════════════════════════ */}
      {currentStepKey === "account" && (
        <StepShell
          title="Investment Account"
          description="Select a fund — account setup options will appear once you choose."
          backButton={<Button variant="ghost" onClick={back}>Back</Button>}
          primaryButton={<Button variant="primary"
            disabled={!selectedProduct || !accountName.trim()}
            onClick={next}>
            Continue to review
          </Button>}
          onSaveDraft={handleSaveDraft}
        >
          {/* Customer banner */}
          {selectedCustomer && (
            <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-lg">
              <CheckCircle2 size={14} strokeWidth={1.75} className="text-success-fg shrink-0" aria-hidden="true" />
              <span className="t-body-med">{fullName(selectedCustomer)}</span>
              <span className="t-caption text-muted-foreground">· CIF {selectedCustomer.cifId}</span>
            </div>
          )}

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
                    <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-white bg-white" : "border-white/40"}`}>
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

          {/* Setup — reveals after product selected */}
          {selectedProduct && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="t-label text-muted-foreground px-2">Account Setup</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Account name + ARO */}
              <SectionCard icon={<Landmark size={15} strokeWidth={2} aria-hidden="true" />} title="Account Details" cols={2}>
                <div className="col-span-2">
                  <Input
                    label="Investment Account Name *"
                    id="account-name-field"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder={selectedCustomer ? fullName(selectedCustomer) : `${firstName} ${lastName}`.trim()}
                  />
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="t-label text-foreground">ARO Code <span className="t-caption text-muted-foreground">(optional)</span></label>
                  <div className="flex items-center gap-2.5">
                    <Input
                      id="aro-username-field"
                      placeholder="Enter ARO username"
                      value={aroUsername}
                      onChange={(e) => { setAroUsername(e.target.value); setAroCode(""); }}
                    />
                    <Button variant="secondary" size="md" loading={fetchingAro} disabled={!aroUsername.trim()} onClick={fetchAroCode}>
                      Fetch code
                    </Button>
                    {aroCode && (
                      <div className="flex items-center gap-2 px-3 h-11 rounded-md bg-success-bg border border-success-fg/20 shrink-0">
                        <CheckCircle2 size={14} strokeWidth={1.75} className="text-success-fg" aria-hidden="true" />
                        <span className="t-body-semi text-success-fg">{aroCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>

              {/* Withdrawal */}
              <Card>
                <CardHeader icon={<CreditCard size={15} strokeWidth={2} aria-hidden="true" />} title="Withdrawal Details" />
                <div className="px-5 py-5 flex flex-col gap-6">
                  <WithdrawalSlotEditor
                    label="Primary"
                    slot={primaryWithdrawal}
                    onChange={setPrimaryWithdrawal}
                    validating={validatingPrimary}
                    onValidate={validatePrimaryBank}
                  />
                  <div className="pt-4 border-t border-border">
                    <Toggle
                      checked={hasSecondary}
                      onChange={setHasSecondary}
                      label="Add secondary withdrawal method"
                      description="Optional — a second bank or mobile money account"
                    />
                  </div>
                  {hasSecondary && (
                    <WithdrawalSlotEditor
                      label="Secondary"
                      slot={secondaryWithdrawal}
                      onChange={setSecondaryWithdrawal}
                      validating={false}
                      onValidate={() => {}}
                    />
                  )}
                </div>
              </Card>
            </div>
          )}

        </StepShell>
      )}


      {/* ══════════════════════════════════════════════════════════════
          STEP: REVIEW & SUBMIT
      ══════════════════════════════════════════════════════════════ */}
      {currentStepKey === "review" && (() => {
        const product  = PRODUCTS.find((p) => p.key === selectedProduct);
        const custName = selectedCustomer ? fullName(selectedCustomer) : `${salutation} ${firstName} ${middleName} ${lastName}`.trim().replace(/\s+/g, " ");
        const primary  = primaryWithdrawal as BankWithdrawal & MobileWithdrawal;
        const anyFatca = Object.values(fatcaIndicia).some(Boolean);
        return (
          <StepShell
            title="Review & Submit"
            description="Confirm all details before submitting for checker approval."
            backButton={<Button variant="ghost" onClick={back}>Back</Button>}
            primaryButton={<Button variant="primary" loading={submitting} onClick={handleSubmit}>Submit for approval</Button>}
          >
            <Alert variant="warn">
              Please review all details carefully. Once submitted, changes will require a new request.
            </Alert>

            {/* ── 1. Personal Information ── */}
            {!selectedCustomer && (
              <Card>
                <CardHeader icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Personal Information" />
                <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-4">
                  <ReviewField label="Full Name"   value={custName} />
                  <ReviewField label="ID Type"     value={idType} />
                  <ReviewField label="ID Number"   value={idNumber} />
                  <ReviewField label="Phone"       value={phone} />
                  <ReviewField label="KRA PIN"     value={kraPin || "—"} />
                  <ReviewField label="Verification" value={
                    verificationResults?.iprs === "success" &&
                    verificationResults?.sanction === "success" &&
                    verificationResults?.blacklist === "success"
                      ? "Passed" : "Not completed"
                  } />
                </div>
              </Card>
            )}

            {/* ── Existing customer banner ── */}
            {selectedCustomer && (
              <Card>
                <CardHeader icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Customer" />
                <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-4">
                  <ReviewField label="Full Name"  value={fullName(selectedCustomer)} />
                  <ReviewField label="CIF"        value={selectedCustomer.cifId} />
                  <ReviewField label="ID"         value={`${selectedCustomer.idType} · ${selectedCustomer.idMasked}`} />
                  <ReviewField label="Email"      value={selectedCustomer.emailMasked} />
                  <ReviewField label="Phone"      value={selectedCustomer.phoneMasked} />
                  <ReviewField label="KYC Status" value={selectedCustomer.kyc === "verified" ? "Verified" : "Pending"} />
                </div>
              </Card>
            )}

            {/* ── 2. Customer Details ── */}
            {!selectedCustomer && (
              <Card>
                <CardHeader icon={<FileText size={15} strokeWidth={2} aria-hidden="true" />} title="Customer Details" />
                <div className="px-5 py-5 flex flex-col gap-5">
                  <div className="grid grid-cols-4 gap-x-8 gap-y-4">
                    <ReviewField label="Date of Birth"        value={dob} />
                    <ReviewField label="Gender"               value={gender} />
                    <ReviewField label="Nationality"          value={nationality} />
                    <ReviewField label="Country of Residence" value={countryOfResidence} />
                    <ReviewField label="Email"                value={email} />
                    {altEmail        && <ReviewField label="Alt. Email"       value={altEmail} />}
                    {altPhone        && <ReviewField label="Alt. Phone"       value={altPhone} />}
                    <ReviewField label="Physical Address"     value={physicalAddress} />
                    <ReviewField label="City"                 value={city} />
                    {postalAddress   && <ReviewField label="Postal Address"   value={postalAddress} />}
                    {postalCode      && <ReviewField label="Postal Code"      value={postalCode} />}
                    <ReviewField label="Occupation"           value={occupation} />
                    {monthlyTurnover && <ReviewField label="Monthly Turnover" value={monthlyTurnover} />}
                    {sourceOfFunds   && <ReviewField label="Source of Funds"  value={sourceOfFunds} />}
                  </div>
                  {nextOfKin.filter(k => k.firstName).length > 0 && (
                    <div className="pt-4 border-t border-border flex flex-col gap-3">
                      <span className="t-label text-muted-foreground">Next of Kin</span>
                      {nextOfKin.filter(k => k.firstName).map((k, i) => (
                        <div key={i} className="grid grid-cols-4 gap-x-8 gap-y-3 px-4 py-3 bg-muted rounded-lg">
                          <ReviewField label="Name"         value={`${k.salutation} ${k.firstName} ${k.lastName}`.trim()} />
                          <ReviewField label="Relationship" value={k.relationship} />
                          <ReviewField label="Mobile"       value={k.mobile || "—"} />
                          <ReviewField label="Email"        value={k.email  || "—"} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* ── 3. Compliance ── */}
            {!selectedCustomer && (
              <Card>
                <CardHeader icon={<Shield size={15} strokeWidth={2} aria-hidden="true" />} title="Compliance" />
                <div className="px-5 py-5 flex flex-col gap-5">
                  {/* FATCA */}
                  <div className="flex flex-col gap-2">
                    <span className="t-label text-muted-foreground">FATCA — U.S. Indicators</span>
                    {anyFatca ? (
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {fatcaIndicia.usCitizenOrResident && <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-warn-fg shrink-0" /><span className="t-body">U.S. Citizen or Tax Resident</span></div>}
                        {fatcaIndicia.bornInUS            && <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-warn-fg shrink-0" /><span className="t-body">Born in the United States</span></div>}
                        {fatcaIndicia.usAddress           && <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-warn-fg shrink-0" /><span className="t-body">U.S. residential or mailing address</span></div>}
                        {fatcaIndicia.usPhone             && <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-warn-fg shrink-0" /><span className="t-body">U.S. telephone number</span></div>}
                        {fatcaIndicia.standingTransfer    && <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-warn-fg shrink-0" /><span className="t-body">Standing instructions to transfer to U.S. accounts</span></div>}
                        {fatcaTin && <ReviewField label="U.S. TIN" value={fatcaTin} />}
                      </div>
                    ) : (
                      <span className="t-body text-muted-foreground">No U.S. indicators declared</span>
                    )}
                  </div>
                  {/* PEP */}
                  <div className="pt-4 border-t border-border flex flex-col gap-3">
                    <span className="t-label text-muted-foreground">PEP Declaration</span>
                    <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                      <ReviewField label="Political affiliation" value={pepPolitical    === true ? "Yes" : pepPolitical    === false ? "No" : "—"} />
                      <ReviewField label="Public office"         value={pepPublicOffice === true ? "Yes" : pepPublicOffice === false ? "No" : "—"} />
                      <ReviewField label="Political position"    value={pepPosition     === true ? "Yes" : pepPosition     === false ? "No" : "—"} />
                    </div>
                    {isPep && pepDetails && (
                      <div className="px-4 py-3 bg-warn-bg rounded-lg">
                        <span className="t-label text-warn-fg block mb-1">PEP Details</span>
                        <span className="t-body text-foreground">{pepDetails}</span>
                      </div>
                    )}
                  </div>
                  {/* Tax Exemption */}
                  <div className="pt-4 border-t border-border grid grid-cols-4 gap-x-8 gap-y-4">
                    <ReviewField label="Tax Exempt" value={taxExempt ? "Yes" : "No"} />
                    {taxExempt && <>
                      <ReviewField label="Certificate No." value={taxCertNo} />
                      <ReviewField label="Issue Date"      value={taxIssueDate} />
                      <ReviewField label="Expiry Date"     value={taxExpiryDate} />
                    </>}
                  </div>
                </div>
              </Card>
            )}

            {/* ── 4. Documents ── */}
            {!selectedCustomer && (
              <Card>
                <CardHeader icon={<CreditCard size={15} strokeWidth={2} aria-hidden="true" />} title="Documents" />
                <div className="px-5 py-5 flex flex-col gap-5">
                  <div className="flex flex-col gap-3">
                    <span className="t-label text-muted-foreground">ID Capture</span>
                    <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                      <ReviewField label="ID Front Photo"    value={idFront ? idFront.name : "Not uploaded"} />
                      <ReviewField label="ID Back Photo"     value={idBack  ? idBack.name  : "Not uploaded"} />
                      <ReviewField label="Face Verification" value={faceVerified ? "Verified" : facePhoto ? "Uploaded, not verified" : "Skipped"} />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border flex flex-col gap-3">
                    <span className="t-label text-muted-foreground">Certified Copies</span>
                    <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                      <ReviewField label="ID Copy (CISL Stamped)"  value={idCopyStamped  ? idCopyStamped.name  : "Not uploaded"} />
                      <ReviewField label="KRA Copy (CISL Stamped)" value={kraCopyStamped ? kraCopyStamped.name : "Not uploaded"} />
                      {isForeigner && <>
                        <ReviewField label="Work Permit"    value={workPermit ? workPermit.name : "Not uploaded"} />
                        <ReviewField label="Valid Passport" value={passport   ? passport.name   : "Not uploaded"} />
                      </>}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border flex flex-col gap-2">
                    <span className="t-label text-muted-foreground">Signature</span>
                    <ReviewField label="Signature Photo" value={signaturePhoto ? signaturePhoto.name : "Not uploaded"} />
                  </div>
                </div>
              </Card>
            )}


            {/* ── 5. Investment Account ── */}
            <Card>
              <CardHeader icon={<Landmark size={15} strokeWidth={2} aria-hidden="true" />} title="Investment Account" />
              <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-4">
                <ReviewField label="Fund"          value={product?.name ?? "—"} />
                <ReviewField label="Account Name"  value={accountName || custName} />
                <ReviewField label="Currency"      value={product?.currency ?? "KES"} />
                <ReviewField label="Min. Deposit"  value={product?.minDeposit ?? "—"} />
                <ReviewField label="Tax on Income" value={product?.taxOnIncome ?? "—"} />
                <ReviewField label="Min. Cash Out" value={product?.minCashOut ?? "—"} />
                {aroCode && <ReviewField label="ARO Code" value={aroCode} />}
              </div>
            </Card>

            {/* ── 6. Withdrawal ── */}
            <Card>
              <CardHeader icon={<CreditCard size={15} strokeWidth={2} aria-hidden="true" />} title="Withdrawal Details" />
              <div className="px-5 py-5 flex flex-col gap-5">
                {/* Primary */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="t-label px-2 py-0.5 rounded-sm bg-primary/10 text-primary">Primary</span>
                    <span className="t-caption text-muted-foreground">{primaryWithdrawal.method === "bank" ? "Bank Transfer" : "Mobile Money"}</span>
                  </div>
                  {primaryWithdrawal.method === "bank" ? (
                    <div className="grid grid-cols-4 gap-x-8 gap-y-3">
                      <ReviewField label="Bank"           value={(primaryWithdrawal as BankWithdrawal).bankName} />
                      <ReviewField label="Account Number" value={(primaryWithdrawal as BankWithdrawal).accountNumber} />
                      <ReviewField label="Account Name"   value={(primaryWithdrawal as BankWithdrawal).accountName} />
                      {(primaryWithdrawal as BankWithdrawal).branch && <ReviewField label="Branch" value={(primaryWithdrawal as BankWithdrawal).branch} />}
                      {(primaryWithdrawal as BankWithdrawal).swiftCode && <ReviewField label="SWIFT" value={(primaryWithdrawal as BankWithdrawal).swiftCode} />}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                      <ReviewField label="Provider" value={(primaryWithdrawal as MobileWithdrawal).provider} />
                      <ReviewField label="Phone"    value={(primaryWithdrawal as MobileWithdrawal).phoneNumber} />
                      <ReviewField label="Name"     value={(primaryWithdrawal as MobileWithdrawal).accountName} />
                    </div>
                  )}
                </div>
                {/* Secondary */}
                {hasSecondary && (
                  <div className="flex flex-col gap-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="t-label px-2 py-0.5 rounded-sm bg-panel text-muted-foreground">Secondary</span>
                      <span className="t-caption text-muted-foreground">{secondaryWithdrawal.method === "bank" ? "Bank Transfer" : "Mobile Money"}</span>
                    </div>
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
                        {(secondaryWithdrawal as BankWithdrawal).branch && <ReviewField label="Branch" value={(secondaryWithdrawal as BankWithdrawal).branch} />}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </StepShell>
        );
      })()}

      {/* ── Success modal + confetti ── */}
      {showSuccess && (
        <SuccessModal
          customerName={selectedCustomer ? fullName(selectedCustomer) : `${firstName} ${lastName}`.trim()}
          jointReturn={jointReturn}
          onGoToAccounts={() => {
            if (jointReturn) {
              // Return to joint account setup with the new pending customer
              navigate("/onboard-customer", {
                state: {
                  ...(locationState as object),
                  pendingCustomer: {
                    id: `PENDING-${Date.now()}`,
                    name: `${firstName} ${lastName}`.trim() || "New Customer",
                    pending: true,
                  },
                },
              });
            } else {
              navigate("/investment-accounts");
            }
          }}
        />
      )}

    </div>
  );
}

/* ─── Confetti + Success modal ──────────────────────────────────── */

function Confetti() {
  const COLORS = ["#75AF0F", "#004E38", "#C7A034", "#4B9FE1", "#E85D4A", "#F5C518", "#9B59B6"];
  const PIECES = 120;

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden" aria-hidden="true">
      {Array.from({ length: PIECES }).map((_, i) => {
        const color  = COLORS[i % COLORS.length];
        const left   = `${Math.random() * 100}%`;
        const delay  = `${Math.random() * 1.2}s`;
        const dur    = `${2.2 + Math.random() * 1.5}s`;
        const size   = `${6 + Math.random() * 8}px`;
        const rotate = `${Math.random() * 360}deg`;
        const shape  = i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0%";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              top: "-20px",
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: shape,
              transform: `rotate(${rotate})`,
              animation: `confetti-fall ${dur} ${delay} ease-in forwards`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function SuccessModal({ customerName, onGoToAccounts, jointReturn }: {
  customerName: string;
  onGoToAccounts: () => void;
  jointReturn?: boolean;
}) {
  return (
    <>
      <Confetti />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-8"
      >
        <div className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]" aria-hidden="true" />
        <div className="relative z-10 w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center text-center px-8 py-10 gap-5">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-cta flex items-center justify-center shrink-0">
            <CheckCircle2 size={32} strokeWidth={1.75} className="text-white" aria-hidden="true" />
          </div>
          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h2 className="t-heading">Account submitted!</h2>
            <p className="t-body text-muted-foreground">
              The investment account for <span className="t-body-semi text-foreground">{customerName}</span> has been submitted to a checker for approval.
            </p>
          </div>
          {/* Info */}
          <div className="w-full bg-muted rounded-xl px-4 py-3.5 flex flex-col gap-1 text-left">
            <span className="t-body-semi text-foreground">What happens next?</span>
            <span className="t-body text-muted-foreground">
              {jointReturn
                ? "The customer record is pending checker approval. They've been added to your joint account holders."
                : "A checker will review and approve the account. You'll be notified once it's approved and active."}
            </span>
          </div>
          {/* CTA */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={onGoToAccounts}
            rightIcon={<ChevronRight size={15} strokeWidth={1.75} aria-hidden="true" />}
          >
            {jointReturn ? "Back to Joint Account Setup" : "Go to Investment Accounts"}
          </Button>
        </div>
      </div>
    </>
  );
}

/* ─── ReviewField ────────────────────────────────────────────────── */
function ReviewField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500, color: "#A8A7A1" }}>{label}</span>
      <span className="t-body text-foreground">{value || "—"}</span>
    </div>
  );
}
