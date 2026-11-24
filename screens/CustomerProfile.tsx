import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  ChevronLeft, ShieldCheck, Pencil,
  User, Users, ShieldAlert, ReceiptText, FileText,
  CheckCircle2, Clock, Flag,
} from "lucide-react";
import { TopBar } from "../components/TopBar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { Separator } from "../components/ui/Separator";
import { getCustomer, fullName, initials } from "../data/customers";
import { CustomerDetailsTab } from "../components/tabs/CustomerDetailsTab";
import { BeneficiariesTab } from "../components/tabs/BeneficiariesTab";
import { PepDetailsTab } from "../components/tabs/PepDetailsTab";
import { TaxExemptionTab } from "../components/tabs/TaxExemptionTab";
import { DocumentsTab } from "../components/tabs/DocumentsTab";

type TabKey = "details" | "beneficiaries" | "pep" | "tax" | "documents";

const TABS: { key: TabKey; label: string; icon: typeof User }[] = [
  { key: "details",       label: "Customer Details", icon: User },
  { key: "beneficiaries", label: "Beneficiaries",    icon: Users },
  { key: "pep",           label: "PEP Details",      icon: ShieldAlert },
  { key: "tax",           label: "Tax Exemption",    icon: ReceiptText },
  { key: "documents",     label: "Documents",         icon: FileText },
];

export function CustomerProfile() {
  const { cifId } = useParams<{ cifId: string }>();
  const customer = cifId ? getCustomer(cifId) : undefined;
  const [tab, setTab] = useState<TabKey>("details");

  if (!customer) return <Navigate to="/customers" replace />;

  const name = fullName(customer);
  const provided = customer.documents.filter((d) => d.status !== "missing").length;

  return (
    <>
      <TopBar
        crumbs={[
          { label: "Account Maintenance" },
          { label: "Customers", to: "/customers" },
          { label: name },
        ]}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-7 pt-5">
          {/* Back link */}
          <Link
            to="/customers"
            className="inline-flex items-center gap-1 t-body text-cta-hover font-medium mb-4 hover:underline"
          >
            <ChevronLeft size={15} aria-hidden="true" /> Back to customers
          </Link>

          {/* Profile hero */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar initials={initials(customer)} size="lg" shape="rounded" />

            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="t-title">{name}</h1>
                {customer.kyc === "verified" ? (
                  <Badge variant="success">
                    <CheckCircle2 size={12} strokeWidth={2.5} aria-hidden="true" /> KYC Verified
                  </Badge>
                ) : (
                  <Badge variant="pending">
                    <Clock size={12} strokeWidth={2.5} aria-hidden="true" /> KYC Pending
                  </Badge>
                )}
                {customer.pep && (
                  <Badge variant="warn">
                    <Flag size={12} strokeWidth={2.5} aria-hidden="true" /> PEP
                  </Badge>
                )}
                <Badge variant="neutral">{customer.customerType}</Badge>
              </div>
              <p className="t-body text-muted-foreground">
                CIF {customer.cifId} · {customer.idType} {customer.idMasked} · DOB {customer.dob} · Onboarded{" "}
                {customer.dateOnboarded}
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2.5 shrink-0">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<ShieldCheck size={15} strokeWidth={1.75} />}
              >
                Run compliance check
              </Button>
              <Button
                variant="primary"
                size="md"
                leftIcon={<Pencil size={15} strokeWidth={2} />}
              >
                Edit details
              </Button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-7 border-b border-border" role="tablist">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              const count =
                t.key === "beneficiaries" && customer.beneficiaries.length > 0
                  ? customer.beneficiaries.length
                  : t.key === "documents"
                  ? `${provided}/${customer.documents.length}`
                  : null;

              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.key)}
                  className={[
                    "flex items-center gap-2 pb-3 -mb-px t-body border-b-2 transition-colors",
                    active
                      ? "border-cta text-primary font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon size={15} strokeWidth={1.75} aria-hidden="true" /> {t.label}
                  {count != null && (
                    <span className="t-caption text-muted-foreground bg-panel rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Separator className="hidden" />

        <div className="px-7 py-6" role="tabpanel">
          {tab === "details"       && <CustomerDetailsTab customer={customer} />}
          {tab === "beneficiaries" && <BeneficiariesTab customer={customer} />}
          {tab === "pep"           && <PepDetailsTab customer={customer} />}
          {tab === "tax"           && <TaxExemptionTab customer={customer} />}
          {tab === "documents"     && <DocumentsTab customer={customer} />}
        </div>
      </div>
    </>
  );
}
