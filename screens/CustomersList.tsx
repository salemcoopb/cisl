import { useMemo, useState, useRef, useEffect } from "react";
import { Search, ChevronLeft, MoreHorizontal, Eye, Pencil, UserPlus, FileEdit, Trash2, Clock, CheckCircle2, XCircle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { Dropdown } from "../components/Dropdown";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../components/ui/Modal";
import { Alert } from "../components/ui/Alert";
import { TableGrid, TableHead, TableBody, TableGridRow, Th, Td, TableEmpty } from "../components/ui/Table";
import { PageShell, PageHeader } from "../components/ui/PageShell";
import { CustomerProfileModal } from "../components/CustomerProfileModal";
import { CustomerEditModal } from "../components/CustomerEditModal";
import { AddCustomerModal } from "../components/AddCustomerModal";
import { customers, fullName } from "../data/customers";
import { drafts, draftFullName } from "../data/drafts";
import { approvals as initialApprovals } from "../data/approvals";
import { hasTab } from "../lib/roles";
import { useRole } from "../lib/RoleContext";
import { useToast } from "../components/ui/Toast";
import { useSortable } from "../lib/useSortable";
import type { Customer } from "../data/customers";
import type { CustomerDraft } from "../data/drafts";
import type { Approval } from "../data/approvals";

type PageTab = "customers" | "drafts" | "submitted" | "pending";

const CUST_COLS  = "2fr 1.4fr 1.8fr 1.4fr 1fr 48px";
const DRAFT_COLS = "2fr 1.2fr 1fr 120px 48px";

/* ─── Reusable row action menu ───────────────────────────────────── */

function RowMenu({ items }: { items: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center justify-end">
      <button
        aria-label="Row actions" aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta"
      >
        <MoreHorizontal size={16} strokeWidth={1.75} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-9 z-20 w-40 bg-card border border-border rounded-md py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              onClick={() => { setOpen(false); item.onClick(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 t-body transition-colors text-left ${
                item.danger
                  ? "text-danger-fg hover:bg-danger-bg"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span className={item.danger ? "text-danger-fg" : "text-muted-foreground"} aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Progress bar for drafts ────────────────────────────────────── */

function CompletionBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-panel overflow-hidden">
        <div
          className={`h-full rounded-full ${pct >= 80 ? "bg-cta" : pct >= 50 ? "bg-warn-fg" : "bg-pending-fg"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="t-caption text-muted-foreground">{pct}%</span>
    </div>
  );
}

/* ─── Approval review modal ──────────────────────────────────────── */

function ApprovalModal({ approval, onClose, onDecision, readOnly = false, onEditResubmit }: {
  approval: Approval | null;
  onClose: () => void;
  onDecision: (id: string, decision: "approved" | "rejected", comment: string) => void;
  readOnly?: boolean;
  onEditResubmit?: (approval: Approval) => void;
}) {
  const [comment, setComment] = useState("");
  const [acting, setActing]   = useState(false);

  useEffect(() => { if (!approval) setComment(""); }, [approval]);

  if (!approval) return null;

  function decide(decision: "approved" | "rejected") {
    if (!comment.trim()) return;
    setActing(true);
    setTimeout(() => {
      setActing(false);
      onDecision(approval!.id, decision, comment);
      onClose();
    }, 500);
  }

  const isNew = approval.type === "new_customer";

  return (
    <Modal open={!!approval} onClose={onClose} size="lg">
      <ModalHeader
        title={isNew ? "New Customer Request" : "Edit Customer Request"}
        description={`${approval.customerName}${approval.cifId ? ` · CIF ${approval.cifId}` : ""} · Submitted by ${approval.submittedBy} on ${approval.submittedAt}`}
        onClose={onClose}
      />
      <ModalBody>
        <div className="flex flex-col gap-5">
          {/* Maker's reason */}
          <div className="flex flex-col gap-1.5">
            <span className="t-label text-muted-foreground">Reason submitted by maker</span>
            <p className="t-body text-foreground bg-muted rounded-md px-4 py-3">{approval.reason}</p>
          </div>

          {/* Diff table */}
          <div className="flex flex-col gap-2">
            <span className="t-label text-muted-foreground">Changes</span>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1.4fr_1fr_1fr] px-4 py-2.5 bg-muted border-b border-border">
                <span className="t-label text-muted-foreground">Field</span>
                <span className="t-label text-muted-foreground">From</span>
                <span className="t-label text-muted-foreground">To</span>
              </div>
              {approval.diff.map((row, i) => (
                <div key={row.field}
                  className={`grid grid-cols-[1.4fr_1fr_1fr] px-4 py-3.5 items-start ${i > 0 ? "border-t border-border-light" : ""}`}>
                  <span className="t-body-semi text-primary">{row.field}</span>
                  <span className="t-body text-muted-foreground">{row.from}</span>
                  <span className="t-body text-foreground font-medium">{row.to}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checker's comment — read-only for maker, shown as alert if rejected */}
          {readOnly ? (
            approval.checkerComment ? (
              <div className="flex flex-col gap-3">
                <Alert variant={approval.status === "rejected" ? "danger" : "success"}
                  title={approval.status === "rejected" ? "Reason for rejection" : "Checker's comment"}>
                  {approval.checkerComment}
                </Alert>
                {/* Reviewer meta */}
                {(approval.reviewedBy || approval.reviewedAt) && (
                  <div className="flex items-center gap-6 px-1">
                    {approval.reviewedBy && (
                      <div className="flex flex-col gap-0.5">
                        <span className="t-label text-muted-foreground">
                          {approval.status === "rejected" ? "Rejected by" : "Approved by"}
                        </span>
                        <span className="t-body">{approval.reviewedBy}</span>
                      </div>
                    )}
                    {approval.reviewedAt && (
                      <div className="flex flex-col gap-0.5">
                        <span className="t-label text-muted-foreground">
                          {approval.status === "rejected" ? "Rejected on" : "Approved on"}
                        </span>
                        <span className="t-body">{approval.reviewedAt}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="t-label text-foreground">
                Checker comment <span className="text-danger-fg">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Add your review comment before approving or rejecting…"
                className="rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none"
              />
              {!comment.trim() && (
                <span className="t-caption text-danger-fg">A comment is required before approving or rejecting.</span>
              )}
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter className="justify-between">
        <Button variant="ghost" size="md" onClick={onClose}>Close</Button>
        {readOnly && approval.status === "rejected" && onEditResubmit && (
          <Button variant="primary" size="md"
            leftIcon={<Pencil size={15} strokeWidth={1.75} aria-hidden="true" />}
            onClick={() => { onClose(); onEditResubmit(approval); }}>
            Edit & Resubmit
          </Button>
        )}
        {!readOnly && (          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="md"
              leftIcon={<XCircle size={15} strokeWidth={1.75} aria-hidden="true" />}
              disabled={!comment.trim() || acting}
              loading={acting}
              onClick={() => decide("rejected")}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<CheckCircle2 size={15} strokeWidth={1.75} aria-hidden="true" />}
              disabled={!comment.trim() || acting}
              loading={acting}
              onClick={() => decide("approved")}
            >
              Approve
            </Button>
          </div>
        )}
      </ModalFooter>
    </Modal>
  );
}

/* ─── Tab bar ────────────────────────────────────────────────────── */

function TabBar({ active, onChange, pendingCount, submittedCount }: {
  active: PageTab; onChange: (t: PageTab) => void; pendingCount: number; submittedCount: number;
}) {
  const { role } = useRole();
  const tabs: { key: PageTab; label: string; count?: number }[] = [
    { key: "customers",  label: "Customers",       count: 37403 },
    ...(hasTab("drafts",     role) ? [{ key: "drafts"     as PageTab, label: "Drafts",           count: drafts.length }] : []),
    ...(hasTab("submitted",  role) ? [{ key: "submitted"  as PageTab, label: "Submitted",         count: submittedCount }] : []),
    ...(hasTab("pending",    role) ? [{ key: "pending"    as PageTab, label: "Pending Approval",  count: pendingCount  }] : []),
  ];

  return (
    <div className="flex gap-6 border-b border-border mb-5" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          onClick={() => onChange(t.key)}
          className={[
            "flex items-center gap-2 pb-3 -mb-px t-body border-b-2 transition-colors whitespace-nowrap",
            active === t.key
              ? "border-cta text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          {t.label}
          {t.count !== undefined && (
            <span className="t-caption bg-panel text-muted-foreground rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {t.count.toLocaleString()}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── Main screen ────────────────────────────────────────────────── */

export function CustomersList() {
  const { role } = useRole();
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab]       = useState<PageTab>("customers");
  const [query, setQuery]   = useState("");
  const [idType, setIdType] = useState("All");
  const [onboarded, setOnboarded] = useState("Any time");

  const [selected, setSelected] = useState<Customer | null>(null);
  const [editing, setEditing]   = useState<Customer | null>(null);
  const [adding, setAdding]     = useState(false);

  const [discardDraft, setDiscardDraft]   = useState<CustomerDraft | null>(null);
  const [draftList, setDraftList]         = useState(drafts);
  const [approvalList, setApprovalList]   = useState(initialApprovals.filter(a => a.status === "pending"));
  const [submittedList]                   = useState(initialApprovals.filter(a => a.submittedBy === "John Mwangi" && a.status !== "approved"));
  const [submittedFilter, setSubmittedFilter] = useState("All");
  const [reviewing, setReviewing]         = useState<Approval | null>(null);
  const [previewCustomer, setPreviewCustomer] = useState<Customer | null>(null);
  const [previewApprovalId, setPreviewApprovalId] = useState<string | undefined>(undefined);

  function openApproval(a: Approval) {
    if (a.type === "new_customer" && a.status === "approved") {
      // Approved — show the live customer record or a preview
      const real = customers.find((c) => fullName(c) === a.customerName);
      if (real) { setSelected(real); return; }
      const get = (field: string) => a.diff.find(d => d.field.toLowerCase() === field.toLowerCase())?.to ?? "";
      setPreviewCustomer({
        cifId: a.cifId ?? "Pending",
        salutation: "", firstName: get("First Name"), middleName: undefined,
        lastName: get("Last Name"), gender: "", dob: "",
        customerType: "Individual",
        idType: get("ID Type"), idNumber: get("ID Number"), idMasked: get("ID Number"),
        kraNumber: "", phone: get("Phone"), phoneMasked: get("Phone"),
        email: get("Email"), emailMasked: get("Email"),
        nationality: "", countryOfResidence: "", city: "",
        physicalAddress: "", occupation: "",
        dateOnboarded: a.submittedAt,
        kyc: "pending", pep: false,
        accounts: [], beneficiaries: [],
        pepAnswers: { politicalAffiliation: false, publicOffice: false, currentPosition: false },
        taxExempt: false, documents: [],
      });
      setPreviewApprovalId(undefined);
    } else {
      // pending/rejected new_customer, or any edit_customer — show diff/approval modal
      setReviewing(a);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      if (q) {
        const hay = `${fullName(c)} ${c.cifId} ${c.idNumber} ${c.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (idType !== "All" && c.idType !== idType) return false;
      if (onboarded !== "Any time" && !c.dateOnboarded.includes(onboarded)) return false;
      return true;
    });
  }, [query, idType, onboarded]);

  const { sorted: sortedCustomers, sortKey, sortDir, toggleSort } = useSortable(
    filtered as unknown as Record<string, unknown>[],
    "lastName" as string
  );

  function handleEditResubmit(a: Approval) {
    setReviewing(null);
    if (a.type === "new_customer") {
      setAdding(true);
    } else if (a.cifId) {
      const c = customers.find((cu) => cu.cifId === a.cifId);
      if (c) setEditing(c);
    }
  }

  function handleDecision(id: string, decision: "approved" | "rejected", comment: string) {
    setApprovalList((p) => p.filter((a) => a.id !== id));
    toast({
      variant: decision === "approved" ? "success" : "error",
      title: decision === "approved" ? "Request approved" : "Request rejected",
      description: `Your decision has been recorded. Comment: "${comment}"`,
    });
  }

  // Reset filters when switching tabs
  function handleTabChange(t: PageTab) {
    setTab(t);
    setQuery("");
  }

  return (
    <>
      <TopBar crumbs={[{ label: "Account Maintenance" }, { label: "Customers" }]} />
      <PageShell>
        <PageHeader
          title="Customers"
          meta={tab === "customers" ? "37,403 total · 128 flagged for review" : tab === "drafts" ? `${draftList.length} saved drafts` : "Pending checker review"}
          action={
            <Button variant="primary" size="md" leftIcon={<UserPlus size={15} strokeWidth={1.75} aria-hidden="true" />} onClick={() => setAdding(true)}>
              New customer
            </Button>
          }
        />

        {/* Tab switcher */}
        <TabBar active={tab} onChange={handleTabChange} pendingCount={approvalList.length} submittedCount={submittedList.length} />

        {/* ── CUSTOMERS TAB ── */}
        {tab === "customers" && <>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex-1">
              <Input placeholder="Search by name, CIF ID, ID number, or email" value={query}
                onChange={(e) => setQuery(e.target.value)} leftSlot={<Search size={16} strokeWidth={1.75} />} />
            </div>
            <Dropdown label="ID Type" value={idType} options={["All","NATID","Passport"]} onChange={setIdType} />
            <Dropdown label="Onboarded" value={onboarded} options={["Any time","2022","2021"]} onChange={setOnboarded} />
          </div>

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
              {sortedCustomers.length === 0 ? (
                <TableEmpty>No customers match your filters.</TableEmpty>
              ) : (sortedCustomers as unknown as Customer[]).map((c) => (
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
                  <RowMenu items={[
                    { label: "View",         icon: <Eye size={14} strokeWidth={1.75} />,      onClick: () => setSelected(c) },
                    { label: "Edit",         icon: <Pencil size={14} strokeWidth={1.75} />,   onClick: () => setEditing(c) },
                    { label: "Open Account", icon: <BookOpen size={14} strokeWidth={1.75} />, onClick: () => navigate("/onboard-customer", { state: { customer: c } }) },
                  ]} />
                </TableGridRow>
              ))}
            </TableBody>
          </TableGrid>

          <div className="flex items-center justify-between pt-4">
            <span className="t-body text-muted-foreground">Showing 1–{filtered.length} of 37,403 customers</span>
            <div className="flex items-center gap-4">
              <div className="h-9 px-3 border border-border rounded-md flex items-center t-body text-muted-foreground">25 per page</div>
              <div className="flex items-center gap-1">
                <Button variant="secondary" size="sm" className="w-8 px-0" aria-label="Previous page"><ChevronLeft size={15} /></Button>
                <Button variant="primary"   size="sm" className="w-8 px-0">1</Button>
                {[2,3].map((n) => <Button key={n} variant="secondary" size="sm" className="w-8 px-0">{n}</Button>)}
                <span className="t-body text-muted-foreground px-1">…</span>
                <Button variant="secondary" size="sm" className="px-2.5">1,497</Button>
                <Button variant="secondary" size="sm" className="w-8 px-0" aria-label="Next page"><ChevronLeft size={15} className="rotate-180" /></Button>
              </div>
            </div>
          </div>
        </>}

        {/* ── DRAFTS TAB ── */}
        {tab === "drafts" && <>
          {draftList.length === 0 ? (
            <TableEmpty>No saved drafts.</TableEmpty>
          ) : (
            <TableGrid>
              <TableHead>
                <TableGridRow cols={DRAFT_COLS} head>
                  <Th>Customer</Th><Th>ID Details</Th><Th>Completion</Th><Th>Last Saved</Th><Th />
                </TableGridRow>
              </TableHead>
              <TableBody>
                {draftList.map((d) => (
                  <TableGridRow key={d.draftId} cols={DRAFT_COLS}>
                    <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                      <span className="t-body-med truncate">{draftFullName(d)}</span>
                      <span className="t-caption text-muted-foreground">Draft {d.draftId}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <Td>{d.idType ?? "—"}</Td>
                      <span className="t-caption text-muted-foreground">{d.idNumber ?? "Not provided"}</span>
                    </div>
                    <CompletionBar pct={d.completionPct} />
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={13} strokeWidth={1.75} aria-hidden="true" />
                      <span className="t-caption">{d.lastSaved}</span>
                    </div>
                    <RowMenu items={[
                      { label: "Resume", icon: <FileEdit size={14} strokeWidth={1.75} />, onClick: () => setAdding(true) },
                      { label: "Discard", icon: <Trash2 size={14} strokeWidth={1.75} />, onClick: () => setDiscardDraft(d), danger: true },
                    ]} />
                  </TableGridRow>
                ))}
              </TableBody>
            </TableGrid>
          )}
        </>}

        {/* ── PENDING APPROVAL TAB — checker/admin only ── */}
        {tab === "pending" && <>
          {approvalList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <CheckCircle2 size={24} strokeWidth={1.5} className="text-cta" aria-hidden="true" />
              </div>
              <p className="t-body-semi">All caught up</p>
              <p className="t-body text-muted-foreground max-w-xs">No pending submissions awaiting your review.</p>
            </div>
          ) : (
            <TableGrid>
              <TableHead>
                <TableGridRow cols="2fr 120px 1.2fr 1fr 80px" head>
                  <Th>Customer</Th><Th>Type</Th><Th>Submitted by</Th><Th>Date</Th><Th />
                </TableGridRow>
              </TableHead>
              <TableBody>
                {approvalList.map((a) => (
                  <TableGridRow key={a.id} cols="2fr 120px 1.2fr 1fr 80px">
                    <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                      <span className="t-body-med truncate">{a.customerName}</span>
                      <span className="t-caption text-muted-foreground">{a.cifId ? `CIF ${a.cifId}` : "New customer"}</span>
                    </div>
                    <div>
                      <Badge variant={a.type === "new_customer" ? "primary" : "info"}>
                        {a.type === "new_customer" ? "New" : "Edit"}
                      </Badge>
                    </div>
                    <Td>{a.submittedBy}</Td>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={13} strokeWidth={1.75} aria-hidden="true" />
                      <span className="t-caption">{a.submittedAt}</span>
                    </div>
                    <div className="flex items-center justify-end">
                      <Button variant="ghost" size="sm"
                        rightIcon={<Eye size={14} strokeWidth={1.75} aria-hidden="true" />}
                        onClick={() => openApproval(a)}>
                        View
                      </Button>
                    </div>
                  </TableGridRow>
                ))}
              </TableBody>
            </TableGrid>
          )}
        </>}

        {/* ── SUBMITTED TAB — maker/admin: pending + rejected only ── */}
        {tab === "submitted" && <>
          {/* Status filter */}
          <div className="flex items-center gap-2.5 mb-4">
            <Dropdown label="Status" value={submittedFilter}
              options={["All", "Pending", "Rejected"]}
              onChange={setSubmittedFilter} />
            <span className="t-caption text-muted-foreground ml-1">
              Approved submissions move to the Customers tab automatically.
            </span>
          </div>

          {(() => {
            const rows = submittedList.filter(a =>
              submittedFilter === "All" ? true :
              submittedFilter === "Pending" ? a.status === "pending" :
              a.status === "rejected"
            );
            return rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                  <Clock size={24} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
                </div>
                <p className="t-body-semi">No submissions</p>
                <p className="t-body text-muted-foreground max-w-xs">
                  {submittedFilter === "Rejected" ? "No rejected submissions." : "Records you submit for approval will appear here."}
                </p>
              </div>
            ) : (
              <TableGrid>
                <TableHead>
                  <TableGridRow cols="2fr 120px 110px 1fr 80px" head>
                    <Th>Customer</Th><Th>Type</Th><Th>Status</Th><Th>Submitted</Th><Th />
                  </TableGridRow>
                </TableHead>
                <TableBody>
                  {rows.map((a) => (
                    <>
                      <TableGridRow key={a.id} cols="2fr 120px 110px 1fr 80px">
                        <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                          <span className="t-body-med truncate">{a.customerName}</span>
                          <span className="t-caption text-muted-foreground">{a.cifId ? `CIF ${a.cifId}` : "New customer"}</span>
                        </div>
                        <div><Badge variant={a.type === "new_customer" ? "primary" : "info"}>{a.type === "new_customer" ? "New" : "Edit"}</Badge></div>
                        <div><Badge variant={a.status === "rejected" ? "danger" : "warn"}>{a.status === "rejected" ? "Rejected" : "Pending"}</Badge></div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock size={13} strokeWidth={1.75} aria-hidden="true" />
                          <span className="t-caption">{a.submittedAt}</span>
                        </div>
                        <div className="flex items-center justify-end">
                          <Button variant="ghost" size="sm"
                            rightIcon={<Eye size={14} strokeWidth={1.75} aria-hidden="true" />}
                            onClick={() => openApproval(a)}>
                            View
                          </Button>
                        </div>
                      </TableGridRow>
                    </>
                  ))}
                </TableBody>
              </TableGrid>
            );
          })()}
        </>}

      </PageShell>

      {/* Modals */}
      <CustomerProfileModal customer={selected} onClose={() => setSelected(null)} onEdit={(c) => { setSelected(null); setEditing(c); }} />
      <CustomerProfileModal customer={previewCustomer} onClose={() => { setPreviewCustomer(null); setPreviewApprovalId(undefined); }}
        approvalId={previewApprovalId}
        onApprovalDecision={(id, decision, comment) => {
          handleDecision(id, decision, comment);
          setApprovalList((p) => p.filter((a) => a.id !== id));
        }}
      />
      <CustomerEditModal customer={editing} onClose={() => setEditing(null)} />
      <AddCustomerModal open={adding} onClose={() => setAdding(false)} />
      <ApprovalModal approval={reviewing} onClose={() => setReviewing(null)} onDecision={handleDecision} readOnly={role !== "checker" && role !== "admin"} onEditResubmit={handleEditResubmit} />

      {/* Discard draft confirmation */}
      <ConfirmModal
        open={!!discardDraft}
        onClose={() => setDiscardDraft(null)}
        onConfirm={() => {
          setDraftList((p) => p.filter((d) => d.draftId !== discardDraft?.draftId));
          setDiscardDraft(null);
        }}
        title="Discard draft?"
        description={discardDraft ? `Discard the draft for "${draftFullName(discardDraft)}"? This cannot be undone.` : ""}
        confirmLabel="Yes, discard"
        cancelLabel="Cancel"
        variant="danger"
      />
    </>
  );
}
