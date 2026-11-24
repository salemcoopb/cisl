import { useState } from "react";
import { User, Landmark, Phone, MapPin, ArrowUpRight, Briefcase } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { TableGrid, TableHead, TableBody, TableGridRow, Th, Td } from "../ui/Table";
import { AccountViewModal } from "../AccountViewModal";
import { getAccount } from "../../data/accounts";
import type { AccountDetail } from "../../data/accounts";
import type { Customer } from "../../data/customers";

const ACC_COLS = "160px 1fr 1fr 160px";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="t-label text-muted-foreground">{label}</span>
      <span className="t-body text-foreground">{value ?? "—"}</span>
    </div>
  );
}

function FieldCard({ icon, title, children }: {
  icon: React.ReactNode; title: string; children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader icon={icon} title={title} />
      <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-6">{children}</div>
    </Card>
  );
}

export function CustomerDetailsTab({ customer }: { customer: Customer }) {
  const [viewingAccount, setViewingAccount] = useState<AccountDetail | null>(null);

  return (
    <>
      <div className="flex flex-col gap-5 max-w-5xl">

        {/* ── Personal Information (inc. Identification) ─────── */}
        <FieldCard icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Personal Information">
          <Field label="CIF ID"        value={customer.cifId} />
          <Field label="Salutation"    value={customer.salutation} />
          <Field label="Gender"        value={customer.gender} />
          <Field label="Date of Birth" value={customer.dob} />
          <Field label="First Name"    value={customer.firstName} />
          <Field label="Middle Name"   value={customer.middleName} />
          <Field label="Last Name"     value={customer.lastName} />
          <Field label="Customer Type" value={customer.customerType} />
          <Field label="ID Type"       value={customer.idType} />
          <Field label="ID Number"     value={customer.idMasked} />
          <Field label="KRA Number"    value={customer.kraNumber} />
        </FieldCard>

        {/* ── Investment Accounts ───────────────────────────── */}
        <Card>
          <CardHeader
            icon={<Landmark size={15} strokeWidth={2} aria-hidden="true" />}
            title="Investment Accounts"
            description="Click an account number to view its details"
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
                    <span>
                      <button
                        onClick={() => {
                          const detail = getAccount(a.accountNo);
                          if (detail) setViewingAccount(detail);
                        }}
                        className="inline-flex items-center gap-1.5 border border-cta text-cta-hover font-semibold rounded-full px-3 py-1 t-caption hover:bg-success-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta"
                      >
                        {a.accountNo}
                        <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
                      </button>
                    </span>
                    <Td>{a.name}</Td>
                    <Td muted>{a.product}</Td>
                    <Td align="right" className="tabular-nums">{a.value.toLocaleString("en-KE")}</Td>
                  </TableGridRow>
                ))}
              </TableBody>
            </TableGrid>
          )}
        </Card>

        {/* ── Contact Information ───────────────────────────── */}
        <FieldCard icon={<Phone size={15} strokeWidth={2} aria-hidden="true" />} title="Contact Information">
          <Field label="Phone Number"      value={customer.phoneMasked} />
          <Field label="Email"             value={customer.emailMasked} />
          <Field label="Alternative Phone" value={customer.altPhone} />
          <Field label="Alternative Email" value={customer.altEmail} />
        </FieldCard>

        {/* ── Location & Address ────────────────────────────── */}
        <FieldCard icon={<MapPin size={15} strokeWidth={2} aria-hidden="true" />} title="Location & Address">
          <Field label="Nationality"          value={customer.nationality} />
          <Field label="Country of Residence" value={customer.countryOfResidence} />
          <Field label="City"                 value={customer.city} />
          <Field label="Physical Address"     value={customer.physicalAddress} />
          <Field label="Postal Address"       value={customer.postalAddress} />
          <Field label="Postal Code"          value={customer.postalCode} />
        </FieldCard>

        {/* ── Employment & Financial Details ────────────────── */}
        <FieldCard icon={<Briefcase size={15} strokeWidth={2} aria-hidden="true" />} title="Employment & Financial Details">
          <Field label="Occupation"                value={customer.occupation} />
          <Field label="Monthly Income / Turnover" value={customer.monthlyIncome} />
          <Field label="Source of Funds"           value={customer.sourceOfFunds} />
        </FieldCard>

      </div>

      {/* Account view modal — opens when account number is clicked */}
      <AccountViewModal account={viewingAccount} onClose={() => setViewingAccount(null)} />
    </>
  );
}
