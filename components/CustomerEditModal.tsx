import { useState, useEffect } from "react";
import {
  User, Landmark, Phone, MapPin, Briefcase,
  UsersRound, ShieldAlert, ReceiptText, FileText,
  FileCheck2, FileClock, FileX, UploadCloud, Eye, Download,
  Plus, Trash2, Check,} from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalTabBar, ModalTab } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { ConfirmModal } from "./ui/ConfirmModal";
import { Toggle } from "./ui/Toggle";
import { FileUpload } from "./ui/FileUpload";
import { Avatar } from "./ui/Avatar";
import { Card, CardHeader, CardBody } from "./ui/Card";
import { Alert } from "./ui/Alert";
import { Badge } from "./ui/Badge";
import { TableGrid, TableHead, TableBody, TableGridRow, Th, Td } from "./ui/Table";
import { useToast } from "./ui/Toast";
import { updateCustomer, fullName, initials } from "../data/customers";
import type { Customer, Beneficiary, CustomerDoc, DocStatus } from "../data/customers";

type EditTab = "details" | "beneficiaries" | "pep" | "tax" | "documents";

/* ─── Shared form primitives ─────────────────────────────────────── */

/** Label + value field — no borders, just stacked text */
function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="t-label text-muted-foreground">{label}</span>
      <span className="t-body text-foreground">{value ?? "—"}</span>
    </div>
  );
}

/** Read-only input — same box as editable inputs but muted, non-interactive */
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
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function SwitchRow({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <span className="t-body">{label}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-10 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta ${checked ? "bg-cta" : "bg-border"}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

/* mirrors FieldCard from view — same Card+header, grid inside */
function EditCard({ icon, title, cols = 4, children }: {
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

/* ─── Doc status config (same as view) ──────────────────────────── */

const statusConfig: Record<DocStatus, { label: string; icon: typeof FileText; color: string }> = {
  verified: { label: "Verified",     icon: FileCheck2, color: "text-success-fg" },
  uploaded: { label: "Uploaded",     icon: FileClock,  color: "text-warn-fg"    },
  missing:  { label: "Not provided", icon: FileX,      color: "text-muted-foreground" },
};

/* ─── EditDocCard — view card + upload slot on missing ───────────── */

/* ─── EditDocCard — thumbnail preview + replace/remove/upload ────── */

function EditDocCard({ doc, onPreview }: { doc: CustomerDoc; onPreview: (d: CustomerDoc) => void }) {
  const hasFile   = doc.status !== "missing";
  const [file, setFile]             = useState<File | null>(null);
  const [removed, setRemoved]       = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const objectUrl  = file ? URL.createObjectURL(file) : null;
  const isImage    = (name?: string | null) => !!name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const showUpload = removed || (!hasFile && !file);
  const displayName = file?.name ?? (removed ? null : doc.fileName);

  // Preview modal state (for newly uploaded local file)
  const [localPreview, setLocalPreview] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setRemoved(false); }
    e.target.value = "";
  }

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden bg-card flex flex-col">
        {/* ── Card header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
          <span className="t-body-med text-foreground truncate pr-2">{doc.label}</span>
          {!removed && !file && doc.status === "verified" && (
            <span className="shrink-0 inline-flex items-center gap-1 t-label text-success-fg bg-success-bg px-2 py-0.5 rounded-sm">
              <FileCheck2 size={11} strokeWidth={2.5} aria-hidden="true" /> Verified
            </span>
          )}
          {!removed && !file && doc.status === "uploaded" && (
            <span className="shrink-0 t-label text-warn-fg bg-warn-bg px-2 py-0.5 rounded-sm">Uploaded</span>
          )}
          {(file || (hasFile && removed)) && (
            <span className="shrink-0 t-label text-info-fg bg-info-bg px-2 py-0.5 rounded-sm">
              {file ? "Replaced" : "Removed"}
            </span>
          )}
        </div>

        <div className="p-4 flex flex-col gap-3">
          {showUpload ? (
            /* ── No file — full upload zone ── */
            <FileUpload
              accept=".pdf,.jpg,.jpeg,.png"
              hint="PDF, JPG or PNG"
              value={null}
              onChange={(f) => { if (f) { setFile(f); setRemoved(false); } }}
            />
          ) : (
            <>
              {/* ── Thumbnail / preview area ── */}
              <div
                className="relative w-full rounded-md overflow-hidden bg-muted border border-border-light"
                style={{ aspectRatio: "16/9" }}
              >
                {objectUrl && isImage(file?.name) ? (
                  /* Real image from newly uploaded file */
                  <img src={objectUrl} alt={doc.label} className="w-full h-full object-cover" />
                ) : objectUrl ? (
                  /* Newly uploaded non-image (PDF etc) */
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <FileText size={28} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />
                    <span className="t-caption text-muted-foreground">{file?.name}</span>
                  </div>
                ) : isImage(doc.fileName) ? (
                  /* Existing image — placeholder thumbnail (real URL would come from backend) */
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-panel">
                    <FileCheck2 size={24} strokeWidth={1.5} className="text-success-fg" aria-hidden="true" />
                    <span className="t-caption text-muted-foreground">{doc.fileName}</span>
                  </div>
                ) : (
                  /* Existing PDF / non-image */
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <FileText size={28} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />
                    <span className="t-caption text-muted-foreground">{doc.fileName}</span>
                  </div>
                )}

                {/* Eye overlay button — opens preview modal */}
                <button
                  onClick={() => file ? setLocalPreview(true) : onPreview(doc)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/40 hover:bg-foreground/60 flex items-center justify-center text-white transition-colors"
                  aria-label={`Preview ${doc.label}`}
                >
                  <Eye size={14} strokeWidth={1.75} />
                </button>
              </div>

              {/* ── Replace / Remove actions ── */}
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-md border border-border t-caption font-medium text-foreground hover:bg-muted transition-colors cursor-pointer">
                  <UploadCloud size={13} strokeWidth={2} aria-hidden="true" /> Replace
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={handleFileChange} />
                </label>
                <button
                  onClick={() => setConfirmRemove(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-md border border-danger-fg/20 bg-danger-bg t-caption font-medium text-danger-fg hover:bg-danger-fg/10 transition-colors"
                >
                  <Trash2 size={13} strokeWidth={2} aria-hidden="true" /> Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Remove confirmation */}
      <ConfirmModal
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={() => { setRemoved(true); setFile(null); setConfirmRemove(false); }}
        title="Remove document?"
        description={`Remove "${doc.label}" (${file?.name ?? doc.fileName})? This change will be included when you submit for approval.`}
        confirmLabel="Yes, remove"
        cancelLabel="Cancel"
        variant="danger"
      />

      {/* Local file preview modal — for newly uploaded files */}
      {localPreview && file && (
        <Modal open={localPreview} onClose={() => setLocalPreview(false)} size="lg">
          <ModalHeader title={doc.label} description={file.name} onClose={() => setLocalPreview(false)} />
          <ModalBody>
            {isImage(file.name) && objectUrl ? (
              <img src={objectUrl} alt={doc.label} className="w-full rounded-lg" />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 bg-muted rounded-lg">
                <FileText size={36} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
                <p className="t-body-med">{file.name}</p>
                <p className="t-caption text-muted-foreground">Preview not available for this file type</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" size="md" onClick={() => setLocalPreview(false)}>Close</Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}

/* ─── Main modal ─────────────────────────────────────────────────── */

interface CustomerEditModalProps {
  customer: Customer | null;
  onClose: () => void;
  onSaved?: (c: Customer) => void;
}

export function CustomerEditModal({ customer, onClose, onSaved }: CustomerEditModalProps) {
  const toast = useToast();
  const [tab, setTab]         = useState<EditTab>("details");
  const [saving, setSaving]             = useState(false);
  const [confirming, setConfirming]     = useState(false);
  const [changeReason, setChangeReason] = useState("");
  const [removingBenIdx, setRemovingBenIdx] = useState<number | null>(null);
  const [preview, setPreview]           = useState<CustomerDoc | null>(null);

  /* flat state — one per editable field */
  const [salutation, setSalutation]     = useState("");
  const [firstName, setFirstName]       = useState("");
  const [middleName, setMiddleName]     = useState("");
  const [lastName, setLastName]         = useState("");
  const [gender, setGender]             = useState("");
  const [dob, setDob]                   = useState("");
  const [phone, setPhone]               = useState("");
  const [altPhone, setAltPhone]         = useState("");
  const [email, setEmail]               = useState("");
  const [altEmail, setAltEmail]         = useState("");
  const [idType, setIdType]             = useState("");
  const [idNumber, setIdNumber]         = useState("");
  const [kraNumber, setKraNumber]       = useState("");
  const [nationality, setNationality]   = useState("");
  const [countryOfRes, setCountryOfRes] = useState("");
  const [city, setCity]                 = useState("");
  const [address, setAddress]           = useState("");
  const [postalAddress, setPostalAddress] = useState("");
  const [postalCode, setPostalCode]       = useState("");
  const [occupation, setOccupation]     = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState("");
  const [bens, setBens]                 = useState<Beneficiary[]>([]);
  const [pepPolitical, setPepPolitical] = useState(false);
  const [pepOffice, setPepOffice]       = useState(false);
  const [pepCurrent, setPepCurrent]     = useState(false);
  const [pepDetails, setPepDetails]     = useState("");
  const [taxExempt, setTaxExempt]       = useState(false);
  const [taxNote, setTaxNote]           = useState("");
  const [certIssueDate, setCertIssueDate]   = useState("");
  const [certExpiryDate, setCertExpiryDate] = useState("");
  const [certFileName, setCertFileName]     = useState<string | null>(null);
  useEffect(() => {
    if (!customer) return;
    setSalutation(customer.salutation);
    setFirstName(customer.firstName);
    setMiddleName(customer.middleName ?? "");
    setLastName(customer.lastName);
    setGender(customer.gender);
    setDob(customer.dob);
    setPhone(customer.phone);
    setAltPhone(customer.altPhone ?? "");
    setEmail(customer.email);
    setAltEmail(customer.altEmail ?? "");
    setIdType(customer.idType);
    setIdNumber(customer.idNumber);
    setKraNumber(customer.kraNumber);
    setNationality(customer.nationality);
    setCountryOfRes(customer.countryOfResidence);
    setCity(customer.city);
    setAddress(customer.physicalAddress);
    setPostalAddress(customer.postalAddress ?? "");
    setPostalCode(customer.postalCode ?? "");
    setOccupation(customer.occupation);
    setMonthlyIncome(customer.monthlyIncome ?? "");
    setSourceOfFunds(customer.sourceOfFunds ?? "");
    setBens(customer.beneficiaries.map((b) => ({ ...b })));
    setPepPolitical(customer.pepAnswers.politicalAffiliation);
    setPepOffice(customer.pepAnswers.publicOffice);
    setPepCurrent(customer.pepAnswers.currentPosition);
    setPepDetails(customer.pepAnswers.details ?? "");
    setTaxExempt(customer.taxExempt);
    setTaxNote(customer.taxNote ?? "");
    setCertIssueDate("");
    setCertExpiryDate("");
    setCertFileName(null);
    setTab("details");
  }, [customer?.cifId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!customer) return null;

  const anyPep = pepPolitical || pepOffice || pepCurrent;

  function updateBen(i: number, field: keyof Beneficiary, val: string) {
    setBens((prev) => prev.map((b, idx) => idx === i ? { ...b, [field]: val } : b));
  }

  // Build diff — compute which fields changed vs original customer
  type DiffRow = { label: string; from: string; to: string };
  function buildDiff(): DiffRow[] {
    const rows: DiffRow[] = [];
    const c = customer;
    const check = (label: string, original: string | undefined | boolean, current: string | boolean) => {
      const orig = String(original ?? "");
      const curr = String(current ?? "");
      if (orig !== curr) rows.push({ label, from: orig || "—", to: curr || "—" });
    };
    check("Salutation",          c.salutation,         salutation);
    check("First Name",          c.firstName,          firstName);
    check("Middle Name",         c.middleName,         middleName);
    check("Last Name",           c.lastName,           lastName);
    check("Gender",              c.gender,             gender);
    check("Date of Birth",       c.dob,                dob);
    check("Phone Number",        c.phone,              phone);
    check("Alternative Phone",   c.altPhone,           altPhone);
    check("Email",               c.email,              email);
    check("Alternative Email",   c.altEmail,           altEmail);
    check("ID Type",             c.idType,             idType);
    check("ID Number",           c.idNumber,           idNumber);
    check("KRA Number",          c.kraNumber,          kraNumber);
    check("Nationality",         c.nationality,        nationality);
    check("Country of Residence",c.countryOfResidence, countryOfRes);
    check("City",                c.city,               city);
    check("Physical Address",    c.physicalAddress,    address);
    check("Postal Address",      c.postalAddress,      postalAddress);
    check("Postal Code",         c.postalCode,         postalCode);
    check("Occupation",          c.occupation,         occupation);
    check("Monthly Income",      c.monthlyIncome,      monthlyIncome);
    check("Source of Funds",     c.sourceOfFunds,      sourceOfFunds);
    check("Tax Exempt",          c.taxExempt,          taxExempt);
    check("Tax Note",            c.taxNote,            taxNote);
    check("PEP — Political",     c.pepAnswers.politicalAffiliation, pepPolitical);
    check("PEP — Public Office", c.pepAnswers.publicOffice,         pepOffice);
    check("PEP — Current Pos.",  c.pepAnswers.currentPosition,      pepCurrent);
    check("PEP Notes",           c.pepAnswers.details,              pepDetails);
    // Beneficiary count change
    if (c.beneficiaries.length !== bens.length) {
      rows.push({ label: "Beneficiaries", from: `${c.beneficiaries.length} listed`, to: `${bens.length} listed` });
    }
    return rows;
  }

  function handleSave() {
    setChangeReason("");
    setConfirming(true);
  }

  function executeSave() {
    setConfirming(false);
    setSaving(true);
    setTimeout(() => {
      const updated = updateCustomer(customer.cifId, {
        salutation, firstName, middleName: middleName || undefined,
        lastName, gender, dob,
        phone, altPhone: altPhone || undefined,
        email, altEmail: altEmail || undefined,
        idType, idNumber, kraNumber, nationality,
        countryOfResidence: countryOfRes,
        city, physicalAddress: address,
        postalAddress: postalAddress || undefined,
        postalCode: postalCode || undefined,
        occupation,
        monthlyIncome: monthlyIncome || undefined,
        sourceOfFunds: sourceOfFunds || undefined,
        beneficiaries: bens,
        pepAnswers: { politicalAffiliation: pepPolitical, publicOffice: pepOffice, currentPosition: pepCurrent, details: pepDetails || undefined },
        taxExempt, taxNote: taxNote || undefined,
      });
      setSaving(false);
      toast({ variant: "success", title: "Submitted for approval", description: `Changes to ${firstName} ${lastName}'s record have been submitted to a checker.` });
      if (updated) onSaved?.(updated);
      onClose();
    }, 600);
  }

  const ACC_COLS = "160px 1fr 1fr 160px";
  const BEN_COLS = "90px 1fr 1fr 1.1fr 1.2fr 1.4fr";

  return (
    <>
    <Modal open={!!customer} onClose={onClose} size="xl" disableBackdropClose>
      <ModalHeader
        onClose={onClose}
        adornment={<Avatar initials={initials(customer)} size="md" shape="rounded" />}
        title={`Edit — ${fullName(customer)}`}
        description={`CIF ${customer.cifId} · Changes are saved on submit`}
      />
      <ModalTabBar>
        {([
          { key: "details",       label: "Customer Details", Icon: User },
          { key: "beneficiaries", label: "Beneficiaries",    Icon: UsersRound },
          { key: "pep",           label: "PEP Details",      Icon: ShieldAlert },
          { key: "tax",           label: "Tax Exemption",    Icon: ReceiptText },
          { key: "documents",     label: "Documents",        Icon: FileText },
        ] as const).map(({ key, label, Icon }) => (
          <ModalTab key={key} active={tab === key} onClick={() => setTab(key)}
            badge={key === "beneficiaries" && bens.length > 0 ? bens.length : undefined}>
            <Icon size={14} strokeWidth={1.75} aria-hidden="true" /> {label}
          </ModalTab>
        ))}
      </ModalTabBar>

      <ModalBody flush>
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* ── DETAILS TAB ── mirrors CustomerDetailsTab exactly ── */}
          {tab === "details" && <>
            {/* Personal Information — includes identification */}
            <EditCard icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Personal Information">
              <ReadonlyInput label="CIF ID"        value={customer.cifId} />
              <FormSelect label="Salutation" value={salutation} options={["Mr","Mrs","Ms","Dr","Prof"]} onChange={setSalutation} />
              <FormSelect label="Gender" value={gender} options={["Male","Female","Other","Prefer not to say"]} onChange={setGender} />
              <Input label="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} placeholder="YYYY-MM-DD" />
              <Input label="First Name"  value={firstName}  onChange={(e) => setFirstName(e.target.value)} />
              <Input label="Middle Name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
              <Input label="Last Name"   value={lastName}   onChange={(e) => setLastName(e.target.value)} />
              <ReadonlyInput label="Customer Type" value={customer.customerType} />
              <FormSelect label="ID Type" value={idType} options={["NATID","Passport","Alien ID"]} onChange={setIdType} />
              <Input label="ID Number"  value={idNumber}  onChange={(e) => setIdNumber(e.target.value)} />
              <Input label="KRA Number" value={kraNumber} onChange={(e) => setKraNumber(e.target.value)} />
            </EditCard>

            {/* Investment Accounts — read-only, same as view */}
            <Card>
              <CardHeader
                icon={<Landmark size={15} strokeWidth={2} aria-hidden="true" />}
                title="Investment Accounts"
                description="Account links are managed separately"
              />
              {customer.accounts.length === 0 ? (
                <div className="px-5 py-6 t-body text-muted-foreground">No linked investment accounts.</div>
              ) : (
                <TableGrid className="border-0 rounded-none">
                  <TableHead>
                    <TableGridRow cols={ACC_COLS} head>
                      <Th>Account No.</Th><Th>Account Name</Th><Th>Product</Th><Th align="right">Value (KES)</Th>
                    </TableGridRow>
                  </TableHead>
                  <TableBody>
                    {customer.accounts.map((a, i) => (
                      <TableGridRow key={a.accountNo} cols={ACC_COLS} className={i === 0 ? "border-t-0" : ""}>
                        <Td>{a.accountNo}</Td>
                        <Td>{a.name}</Td>
                        <Td muted>{a.product}</Td>
                        <Td align="right" className="tabular-nums">{a.value.toLocaleString("en-KE")}</Td>
                      </TableGridRow>
                    ))}
                  </TableBody>
                </TableGrid>
              )}
            </Card>

            {/* Contact Information */}
            <EditCard icon={<Phone size={15} strokeWidth={2} aria-hidden="true" />} title="Contact Information">
              <Input label="Phone Number"      value={phone}    onChange={(e) => setPhone(e.target.value)} />
              <Input label="Email"             value={email}    onChange={(e) => setEmail(e.target.value)} />
              <Input label="Alternative Phone" value={altPhone} onChange={(e) => setAltPhone(e.target.value)} />
              <Input label="Alternative Email" value={altEmail} onChange={(e) => setAltEmail(e.target.value)} />
            </EditCard>

            {/* Location & Address */}
            <EditCard icon={<MapPin size={15} strokeWidth={2} aria-hidden="true" />} title="Location & Address">
              <Input label="Nationality"          value={nationality}   onChange={(e) => setNationality(e.target.value)} />
              <Input label="Country of Residence" value={countryOfRes}  onChange={(e) => setCountryOfRes(e.target.value)} />
              <Input label="City"                 value={city}          onChange={(e) => setCity(e.target.value)} />
              <Input label="Physical Address"     value={address}       onChange={(e) => setAddress(e.target.value)} />
              <Input label="Postal Address"       value={postalAddress} onChange={(e) => setPostalAddress(e.target.value)} />
              <Input label="Postal Code"          value={postalCode}    onChange={(e) => setPostalCode(e.target.value)} />
            </EditCard>

            {/* Employment & Financial Details */}
            <EditCard icon={<Briefcase size={15} strokeWidth={2} aria-hidden="true" />} title="Employment & Financial Details" cols={3}>
              <Input label="Occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
              <FormSelect
                label="Monthly Income / Turnover"
                value={monthlyIncome}
                options={["", "Less than KES 10,000", "KES 10,000–50,000", "KES 51,000–100,000", "KES 101,000–200,000", "KES 201,000–500,000", "KES 501,000–1,000,000"]}
                onChange={setMonthlyIncome}
              />
              <FormSelect
                label="Source of Funds"
                value={sourceOfFunds}
                options={["", "Salary", "Business", "Investment Returns", "Savings", "Inheritance", "Pension"]}
                onChange={setSourceOfFunds}
              />
            </EditCard>
          </>}

          {/* ── BENEFICIARIES TAB ── mirrors BeneficiariesTab ── */}
          {tab === "beneficiaries" && <>
            <div className="flex items-center justify-between">
              <span className="t-body-semi">Beneficiaries</span>
              <Button variant="secondary" size="sm"
                leftIcon={<Plus size={14} strokeWidth={2} aria-hidden="true" />}
                onClick={() => setBens((p) => [...p, { salutation:"Mr", firstName:"", lastName:"", relationship:"", mobile:"", email:"" }])}>
                Add beneficiary
              </Button>
            </div>

            {bens.length === 0 ? (
              <div className="border border-border rounded-lg flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <UsersRound size={22} strokeWidth={1.75} className="text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="t-body-med">No beneficiaries added yet</p>
                <p className="t-body text-muted-foreground max-w-xs">Record who this customer's holdings pass to.</p>
              </div>
            ) : (
              /* When there are beneficiaries show editable cards */
              <div className="flex flex-col gap-4">
                {bens.map((b, i) => (
                  <Card key={i}>
                    <CardHeader
                      icon={<UsersRound size={15} strokeWidth={2} aria-hidden="true" />}
                      title={`Beneficiary ${i + 1}`}
                      action={
                        <Button variant="ghost" size="sm" className="text-danger-fg hover:bg-danger-bg"
                          leftIcon={<Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />}
                          onClick={() => setRemovingBenIdx(i)}>
                          Remove
                        </Button>
                      }
                    />
                    <div className="px-5 py-5 grid grid-cols-3 gap-x-8 gap-y-5">
                      <FormSelect label="Salutation" value={b.salutation} options={["Mr","Mrs","Ms","Dr","Prof"]} onChange={(v) => updateBen(i,"salutation",v)} />
                      <Input label="First Name"   value={b.firstName}    onChange={(e) => updateBen(i,"firstName",   e.target.value)} />
                      <Input label="Last Name"    value={b.lastName}     onChange={(e) => updateBen(i,"lastName",    e.target.value)} />
                      <Input label="Relationship" value={b.relationship} onChange={(e) => updateBen(i,"relationship",e.target.value)} />
                      <Input label="Mobile"       value={b.mobile}       onChange={(e) => updateBen(i,"mobile",      e.target.value)} />
                      <Input label="Email"        value={b.email}        onChange={(e) => updateBen(i,"email",       e.target.value)} />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>}

          {/* ── PEP TAB ── mirrors PepDetailsTab ── */}
          {tab === "pep" && <>
            <Alert variant={anyPep ? "warn" : "info"}>
              {anyPep
                ? "This customer is flagged as a Politically Exposed Person. Enhanced due diligence applies."
                : "Update the customer's political exposure declarations below."}
            </Alert>

            {/* Same 2-col card grid as view, but with toggles instead of badges */}
            <div className="grid grid-cols-2 gap-4">
              {([
                { q: "Do you have any political affiliation?",       val: pepPolitical, set: setPepPolitical },
                { q: "Do you hold or have held a public office?",    val: pepOffice,    set: setPepOffice    },
                { q: "Do you currently hold a political position?",  val: pepCurrent,   set: setPepCurrent   },
              ] as const).map(({ q, val, set }) => (
                <Card key={q}>
                  <CardBody className="flex items-center justify-between gap-4 py-3">
                    <span className="t-body">{q}</span>
                    <Toggle checked={val} onChange={set} />
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Due diligence notes — shown when any PEP flag is on (same position as view) */}
            {anyPep && (
              <div className="flex flex-col gap-1.5">
                <label className="t-label text-foreground">Due Diligence Notes</label>
                <textarea value={pepDetails} onChange={(e) => setPepDetails(e.target.value)} rows={4}
                  placeholder="Describe the political role, affiliation or relevant context…"
                  className="rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none" />
              </div>
            )}
          </>}

          {/* ── TAX TAB ── mirrors TaxExemptionTab ── */}
          {tab === "tax" && <>
            <Alert variant="info">
              Indicates whether this customer is exempt from tax and any supporting documentation on file.
            </Alert>

            <Card>
              <CardBody className="flex items-center justify-between gap-4 py-3">
                <span className="t-body">Are you exempted from tax?</span>
                <Toggle checked={taxExempt} onChange={setTaxExempt} />
              </CardBody>
            </Card>

            {taxExempt && <>
              {/* Exemption details note */}
              <div className="flex flex-col gap-1.5">
                <label className="t-label text-foreground">Exemption Details</label>
                <textarea value={taxNote} onChange={(e) => setTaxNote(e.target.value)} rows={2}
                  placeholder="e.g. Tax-exempt under registered charitable trust. Certificate ref: KRA/EX/2022/0148"
                  className="rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none" />
              </div>

              {/* Certificate details card */}
              <Card>
                <CardHeader
                  icon={<ReceiptText size={15} strokeWidth={2} aria-hidden="true" />}
                  title="Tax Exemption Certificate Details"
                />
                <div className="px-5 py-5 flex flex-col gap-5">
                  {/* Date fields */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                    <Input
                      label="Certificate Issue Date"
                      type="date"
                      value={certIssueDate}
                      onChange={(e) => setCertIssueDate(e.target.value)}
                    />
                    <Input
                      label="Certificate Expiry Date"
                      type="date"
                      value={certExpiryDate}
                      onChange={(e) => setCertExpiryDate(e.target.value)}
                    />
                  </div>

                  {/* Certificate upload */}
                  <div className="flex flex-col gap-2">
                    <span className="t-label text-foreground">Tax Exemption Certificate</span>
                    <FileUpload
                      accept=".pdf,.jpg,.jpeg,.png"
                      hint="File supported: PDF, JPG or PNG"
                      value={certFileName}
                      onChange={(f) => setCertFileName(f?.name ?? null)}
                    />
                  </div>

                  <Alert variant="warn">
                    A tax exemption certificate is required when claiming tax exemption.
                  </Alert>
                </div>
              </Card>
            </>}
          </>}

          {/* ── DOCUMENTS TAB ── mirrors DocumentsTab + upload slots ── */}
          {tab === "documents" && <>
            <div className="flex items-center justify-between">
              <span className="t-body-semi">Customer Documents</span>
              <div className="flex items-center gap-3">
                <span className="t-body text-muted-foreground">
                  {customer.documents.filter((d) => d.status !== "missing").length} of {customer.documents.length} provided
                </span>
                <div className="w-28 h-1.5 rounded-full bg-panel overflow-hidden">
                  <div className="h-full bg-cta rounded-full"
                    style={{ width: `${Math.round(customer.documents.filter((d) => d.status !== "missing").length / customer.documents.length * 100)}%` }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {customer.documents.map((doc) => (
                <EditDocCard key={doc.label} doc={doc} onPreview={setPreview} />
              ))}
            </div>
          </>}

        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="primary" size="md" loading={saving} onClick={handleSave}>Save changes</Button>
      </ModalFooter>
    </Modal>

    {/* Doc preview sub-modal */}
    {preview && (
      <Modal open={!!preview} onClose={() => setPreview(null)} size="lg">
        <ModalHeader title={preview.label} description={preview.fileName}
          adornment={<span className="w-8 h-8 rounded-md bg-muted flex items-center justify-center"><FileText size={15} className="text-muted-foreground" /></span>}
          onClose={() => setPreview(null)} />
        <ModalBody>
          <div className="rounded-lg border border-border bg-muted flex flex-col items-center justify-center min-h-[300px] gap-3">
            <div className="w-16 h-16 rounded-xl bg-panel flex items-center justify-center">
              <FileText size={28} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
            </div>
            <p className="t-body-med text-foreground">{preview.fileName}</p>
            <p className="t-caption text-muted-foreground">Preview not available in this environment</p>
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
            <div className="flex flex-col gap-0.5"><span className="t-label text-muted-foreground">Document</span><span className="t-body">{preview.label}</span></div>
            <div className="flex flex-col gap-0.5"><span className="t-label text-muted-foreground">Status</span><span className={`t-body ${statusConfig[preview.status].color}`}>{statusConfig[preview.status].label}</span></div>
            {preview.date && <div className="flex flex-col gap-0.5"><span className="t-label text-muted-foreground">Uploaded</span><span className="t-body">{preview.date}</span></div>}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" size="md" onClick={() => setPreview(null)}>Close</Button>
          <Button variant="secondary" size="md" leftIcon={<Download size={15} aria-hidden="true" />}
            onClick={() => { toast({ variant:"success", title:"Download started", description:`${preview.fileName} is being downloaded.` }); }}>
            Download
          </Button>
        </ModalFooter>
      </Modal>
    )}
    {/* Remove beneficiary confirmation */}
    <ConfirmModal
      open={removingBenIdx !== null}
      onClose={() => setRemovingBenIdx(null)}
      onConfirm={() => {
        setBens((p) => p.filter((_, idx) => idx !== removingBenIdx));
        setRemovingBenIdx(null);
      }}
      title="Remove beneficiary?"
      description={
        removingBenIdx !== null && bens[removingBenIdx]
          ? `Remove ${bens[removingBenIdx].firstName} ${bens[removingBenIdx].lastName} as a beneficiary? This change will still need to be saved and submitted for approval.`
          : undefined
      }
      confirmLabel="Yes, remove"
      cancelLabel="Cancel"
      variant="danger"
    />

    {/* Confirmation dialog */}
    <ConfirmModal
      open={confirming}
      onClose={() => setConfirming(false)}
      onConfirm={executeSave}
      title="Submit for approval"
      subtitle={`${fullName(customer)} · CIF ${customer.cifId}`}
      description={(() => {
        const diff = buildDiff();
        return (
          <div className="flex flex-col gap-4">
            <p className="t-body text-muted-foreground">
              Review the changes you have made before submitting to checker for approval.
            </p>
            {diff.length === 0 ? (
              <p className="t-body text-muted-foreground italic">No changes detected.</p>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[1.4fr_1fr_1fr] px-4 py-2.5 bg-muted border-b border-border">
                  <span className="t-label text-muted-foreground">Detail changing</span>
                  <span className="t-label text-muted-foreground">From</span>
                  <span className="t-label text-muted-foreground">To</span>
                </div>
                {/* Rows */}
                {diff.map((row, i) => (
                  <div
                    key={row.label}
                    className={`grid grid-cols-[1.4fr_1fr_1fr] px-4 py-3.5 items-start ${i > 0 ? "border-t border-border-light" : ""}`}
                  >
                    <span className="t-body-semi text-primary">{row.label}</span>
                    <span className="t-body text-muted-foreground">{row.from}</span>
                    <span className="t-body text-foreground font-medium">{row.to}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Reason for change — required */}
            <div className="flex flex-col gap-1.5">
              <label className="t-label text-foreground">
                Reason for change <span className="text-danger-fg">*</span>
              </label>
              <textarea
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                rows={3}
                placeholder="Explain why this change is being made (required for audit trail)…"
                className="rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none"
              />
              {changeReason.trim() === "" && (
                <span className="t-caption text-danger-fg">A reason is required before submitting.</span>
              )}
            </div>
          </div>
        );
      })()}
      confirmLabel="Submit for approval"
      cancelLabel="Go back"
      loading={saving}
      disableConfirm={changeReason.trim() === ""}
    />
    </>
  );
}
