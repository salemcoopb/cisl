import { useState } from "react";
import {
  ShieldCheck, Pencil,
  User, Users, ShieldAlert, ReceiptText, FileText,
  CheckCircle2, Clock, Flag, XCircle,
} from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalTabBar, ModalTab, ModalFooter } from "./ui/Modal";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Avatar } from "./ui/Avatar";
import { useToast } from "./ui/Toast";
import { fullName, initials } from "../data/customers";
import type { Customer } from "../data/customers";
import { CustomerDetailsTab } from "./tabs/CustomerDetailsTab";
import { BeneficiariesTab } from "./tabs/BeneficiariesTab";
import { PepDetailsTab } from "./tabs/PepDetailsTab";
import { TaxExemptionTab } from "./tabs/TaxExemptionTab";
import { DocumentsTab } from "./tabs/DocumentsTab";

type TabKey = "details" | "beneficiaries" | "pep" | "tax" | "documents";

const TABS: { key: TabKey; label: string; icon: typeof User }[] = [
  { key: "details",       label: "Customer Details", icon: User },
  { key: "beneficiaries", label: "Beneficiaries",    icon: Users },
  { key: "pep",           label: "PEP Details",      icon: ShieldAlert },
  { key: "tax",           label: "Tax Exemption",    icon: ReceiptText },
  { key: "documents",     label: "Documents",        icon: FileText },
];

interface CustomerProfileModalProps {
  customer: Customer | null;
  onClose: () => void;
  onEdit?: (customer: Customer) => void;
  /** When set, shows Approve/Reject footer for checker reviewing a new customer */
  approvalId?: string;
  onApprovalDecision?: (id: string, decision: "approved" | "rejected", comment: string) => void;
}

export function CustomerProfileModal({ customer, onClose, onEdit, approvalId, onApprovalDecision }: CustomerProfileModalProps) {
  const toast = useToast();
  const [tab, setTab] = useState<TabKey>("details");
  const [comment, setComment] = useState("");
  const [acting, setActing] = useState(false);

  const isApprovalView = !!approvalId && !!onApprovalDecision;

  function decide(decision: "approved" | "rejected") {
    if (!comment.trim()) return;
    setActing(true);
    setTimeout(() => {
      setActing(false);
      onApprovalDecision!(approvalId!, decision, comment);
      onClose();
    }, 500);
  }

  if (!customer) return null;

  const name = fullName(customer);
  const provided = customer.documents.filter((d) => d.status !== "missing").length;

  return (
    <Modal open={!!customer} onClose={onClose} size="xl">
      {/* Header — avatar + name + badges */}
      <ModalHeader
        onClose={onClose}
        adornment={<Avatar initials={initials(customer)} size="md" shape="rounded" />}
        title={
          <div className="flex items-center gap-2 flex-wrap">
            <span>{name}</span>
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
        }
        description={`CIF ${customer.cifId} · ${customer.idType} ${customer.idMasked} · DOB ${customer.dob} · Onboarded ${customer.dateOnboarded}`}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ShieldCheck size={14} strokeWidth={1.75} aria-hidden="true" />}
            >
              Compliance check
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Pencil size={14} strokeWidth={2} aria-hidden="true" />}
              onClick={() => onEdit?.(customer)}
            >
              Edit details
            </Button>
          </>
        }
      />

      {/* Tab bar */}
      <ModalTabBar>
        {TABS.map((t) => {
          const Icon = t.icon;
          const badge =
            t.key === "beneficiaries" && customer.beneficiaries.length > 0
              ? customer.beneficiaries.length
              : t.key === "documents"
              ? `${provided}/${customer.documents.length}`
              : undefined;

          return (
            <ModalTab
              key={t.key}
              active={tab === t.key}
              onClick={() => setTab(t.key)}
              badge={badge}
            >
              <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
              {t.label}
            </ModalTab>
          );
        })}
      </ModalTabBar>

      {/* Tab content */}
      <ModalBody flush>
        <div className="px-6 py-5" role="tabpanel">
          {tab === "details"       && <CustomerDetailsTab customer={customer} />}
          {tab === "beneficiaries" && <BeneficiariesTab customer={customer} />}
          {tab === "pep"           && <PepDetailsTab customer={customer} />}
          {tab === "tax"           && <TaxExemptionTab customer={customer} />}
          {tab === "documents"     && <DocumentsTab customer={customer} />}
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className={isApprovalView ? "flex-col items-stretch gap-3" : ""}>
        {isApprovalView ? (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="t-label text-foreground">
                Checker comment <span className="text-danger-fg">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Add your review comment before approving or rejecting…"
                className="rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="md" onClick={onClose} disabled={acting}>Close</Button>
              <div className="flex items-center gap-2">
                <Button variant="danger" size="md" loading={acting} disabled={!comment.trim()}
                  leftIcon={<XCircle size={15} strokeWidth={1.75} aria-hidden="true" />}
                  onClick={() => decide("rejected")}>
                  Reject
                </Button>
                <Button variant="primary" size="md" loading={acting} disabled={!comment.trim()}
                  leftIcon={<CheckCircle2 size={15} strokeWidth={1.75} aria-hidden="true" />}
                  onClick={() => decide("approved")}>
                  Approve
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Button variant="ghost" size="md" onClick={onClose}>Close</Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
