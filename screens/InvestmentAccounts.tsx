import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Pencil, MoreHorizontal, UserPlus, FileEdit, Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../components/ui/Modal";
import { Alert } from "../components/ui/Alert";
import { TableGrid, TableHead, TableBody, TableGridRow, Th, Td, TableEmpty } from "../components/ui/Table";
import { PageShell, PageHeader } from "../components/ui/PageShell";
import { Dropdown } from "../components/Dropdown";
import { AccountViewModal } from "../components/AccountViewModal";
import { AccountEditModal } from "../components/AccountEditModal";
import { accountList, getAccount } from "../data/accounts";
import { accountDrafts, accountApprovals as initialApprovals } from "../data/accountDrafts";
import type { AccountDetail } from "../data/accounts";
import type { AccountDraft, AccountApproval } from "../data/accountDrafts";
import { hasTab } from "../lib/roles";
import { useRole } from "../lib/RoleContext";
import { useToast } from "../components/ui/Toast";
import { useSortable } from "../lib/useSortable";

type PageTab = "accounts" | "drafts" | "submitted" | "pending";
const COLS = "1.2fr 1.8fr 100px 1.4fr 1fr 1fr 48px";
const DRAFT_COLS = "2fr 1.2fr 1.2fr 120px 48px";

/* ─── Row action menu ────────────────────────────────────────────── */

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
      <button aria-label="Actions" aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta">
        <MoreHorizontal size={16} strokeWidth={1.75} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-9 z-20 w-44 bg-card border border-border rounded-md py-1 shadow-lg">
          {items.map((item) => (
            <button key={item.label} role="menuitem"
              onClick={() => { setOpen(false); item.onClick(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 t-body transition-colors text-left ${item.danger ? "text-danger-fg hover:bg-danger-bg" : "text-foreground hover:bg-muted"}`}>
              <span className={item.danger ? "text-danger-fg" : "text-muted-foreground"} aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Progress bar ───────────────────────────────────────────────── */

function CompletionBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-panel overflow-hidden">
        <div className={`h-full rounded-full ${pct >= 80 ? "bg-cta" : pct >= 50 ? "bg-warn-fg" : "bg-pending-fg"}`}
          style={{ width: `${pct}%` }} />
      </div>
      <span className="t-caption text-muted-foreground">{pct}%</span>
    </div>
  );
}

/* ─── Tab bar ────────────────────────────────────────────────────── */

function TabBar({ active, onChange, counts }: {
  active: PageTab;
  onChange: (t: PageTab) => void;
  counts: Record<PageTab, number | undefined>;
}) {
  const { role } = useRole();
  const tabs: { key: PageTab; label: string }[] = [
    { key: "accounts",  label: "Accounts" },
    ...(hasTab("drafts",    role) ? [{ key: "drafts"    as PageTab, label: "Drafts" }] : []),
    ...(hasTab("submitted", role) ? [{ key: "submitted" as PageTab, label: "Submitted" }] : []),
    ...(hasTab("pending",   role) ? [{ key: "pending"   as PageTab, label: "Pending Approval" }] : []),
  ];
  return (
    <div className="flex gap-6 border-b border-border mb-5" role="tablist">
      {tabs.map((t) => (
        <button key={t.key} role="tab" aria-selected={active === t.key}
          onClick={() => onChange(t.key)}
          className={["flex items-center gap-2 pb-3 -mb-px t-body border-b-2 transition-colors whitespace-nowrap",
            active === t.key ? "border-cta text-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground",
          ].join(" ")}>
          {t.label}
          {counts[t.key] !== undefined && (
            <span className="t-caption bg-panel text-muted-foreground rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {counts[t.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── Screen ─────────────────────────────────────────────────────── */

export function InvestmentAccounts() {
  const { role } = useRole();
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab]                     = useState<PageTab>("accounts");
  const [query, setQuery]                 = useState("");
  const [typeFilter, setTypeFilter]       = useState("All");
  const [productFilter, setProductFilter] = useState("All");
  const [viewing, setViewing]             = useState<AccountDetail | null>(null);
  const [editing, setEditing]             = useState<AccountDetail | null>(null);
  const [reviewingApproval, setReviewingApproval] = useState<AccountApproval | null>(null);
  const [discardDraft, setDiscardDraft]   = useState<AccountDraft | null>(null);
  const [draftList, setDraftList]         = useState(accountDrafts);
  const [approvalList, setApprovalList]   = useState(initialApprovals.filter(a => a.status === "pending"));
  const [submittedList]                   = useState(initialApprovals.filter(a => a.submittedBy === "John Mwangi" && a.status !== "approved"));
  const [submittedFilter, setSubmittedFilter] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accountList.filter((a) => {
      if (q) {
        const hay = `${a.accountNo} ${a.holderName} ${a.product} ${a.cifId ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (typeFilter !== "All" && a.accountType !== typeFilter) return false;
      if (productFilter !== "All" && a.product !== productFilter) return false;
      return true;
    });
  }, [query, typeFilter, productFilter]);

  const { sorted, sortKey, sortDir, toggleSort } = useSortable(
    filtered as unknown as Record<string, unknown>[],
    "holderName"
  );

  function handleTabChange(t: PageTab) { setTab(t); setQuery(""); }

  return (
    <>
      <TopBar crumbs={[{ label: "Account Maintenance" }, { label: "Investment Accounts" }]} />
      <PageShell>
        <PageHeader
          title="Investment Accounts"
          meta={tab === "accounts" ? `${accountList.length} total accounts` : tab === "drafts" ? `${draftList.length} saved drafts` : tab === "submitted" ? "Your submissions" : "Pending review"}
          action={
            <Button variant="primary" size="md" leftIcon={<UserPlus size={15} strokeWidth={1.75} aria-hidden="true" />} onClick={() => navigate("/onboard-customer")}>
              New account
            </Button>
          }
        />

        <TabBar active={tab} onChange={handleTabChange} counts={{
          accounts:  accountList.length,
          drafts:    draftList.length,
          submitted: submittedList.length,
          pending:   approvalList.length,
        }} />

        {/* ── ACCOUNTS TAB ── */}
        {tab === "accounts" && <>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex-1">
              <Input placeholder="Search by account number, name, or product" value={query}
                onChange={(e) => setQuery(e.target.value)} leftSlot={<Search size={16} strokeWidth={1.75} />} />
            </div>
            <Dropdown label="Account Type" value={typeFilter}
              options={["All","Individual","Corporate","Joint"]} onChange={setTypeFilter} />
            <Dropdown label="Product" value={productFilter}
              options={["All","Co-op Fixed Income Gratuity Fund","Co-op Bond Fund","Co-op Money Market Fund"]}
              onChange={setProductFilter} />
          </div>
          <TableGrid>
            <TableHead>
              <TableGridRow cols={COLS} head>
                <Th sort={sortKey === "accountNo" ? sortDir : null} onSort={() => toggleSort("accountNo")}>Account Number</Th>
                <Th sort={sortKey === "holderName" ? sortDir : null} onSort={() => toggleSort("holderName")}>Account Name</Th>
                <Th>Type</Th>
                <Th sort={sortKey === "product" ? sortDir : null} onSort={() => toggleSort("product")}>Product</Th>
                <Th>Created By</Th>
                <Th sort={sortKey === "opened" ? sortDir : null} onSort={() => toggleSort("opened")}>Date Opened</Th>
                <Th />
              </TableGridRow>
            </TableHead>
            <TableBody>
              {sorted.length === 0 ? <TableEmpty>No accounts match your filters.</TableEmpty>
                : (sorted as unknown as AccountDetail[]).map((a) => (
                  <TableGridRow key={a.accountNo} cols={COLS}>
                    <span className="t-body-med text-primary">{a.accountNo}</span>
                    <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                      <span className="t-body truncate">{a.holderName}</span>
                      {a.cifId && <span className="t-caption text-muted-foreground">CIF {a.cifId}</span>}
                    </div>
                    <Td muted>{a.accountType}</Td>
                    <Td>{a.product}</Td>
                    <Td muted>{a.createdBy}</Td>
                    <Td muted>{a.opened}</Td>
                    <RowMenu items={[
                      { label: "View Account", icon: <Eye size={14} strokeWidth={1.75} />,    onClick: () => setViewing(a) },
                      { label: "Edit Account", icon: <Pencil size={14} strokeWidth={1.75} />, onClick: () => setEditing(a) },
                    ]} />
                  </TableGridRow>
                ))}
            </TableBody>
          </TableGrid>
          <div className="pt-4">
            <span className="t-body text-muted-foreground">Showing 1–{sorted.length} of {accountList.length} accounts</span>
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
                  <Th>Account Holder</Th><Th>Product</Th><Th>Completion</Th><Th>Last Saved</Th><Th />
                </TableGridRow>
              </TableHead>
              <TableBody>
                {draftList.map((d) => (
                  <TableGridRow key={d.draftId} cols={DRAFT_COLS}>
                    <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                      <span className="t-body-med truncate">{d.holderName ?? "Unnamed draft"}</span>
                      <span className="t-caption text-muted-foreground">Draft {d.draftId}{d.cifId ? ` · CIF ${d.cifId}` : ""}</span>
                    </div>
                    <Td>{d.product ?? "—"}</Td>
                    <CompletionBar pct={d.completionPct} />
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={13} strokeWidth={1.75} aria-hidden="true" />
                      <span className="t-caption">{d.lastSaved}</span>
                    </div>
                    <RowMenu items={[
                      { label: "Resume",  icon: <FileEdit size={14} strokeWidth={1.75} />, onClick: () => {} },
                      { label: "Discard", icon: <Trash2  size={14} strokeWidth={1.75} />, onClick: () => setDiscardDraft(d), danger: true },
                    ]} />
                  </TableGridRow>
                ))}
              </TableBody>
            </TableGrid>
          )}
        </>}

        {/* ── SUBMITTED TAB — pending + rejected only ── */}
        {tab === "submitted" && <>
          <div className="flex items-center gap-2.5 mb-4">
            <Dropdown label="Status" value={submittedFilter}
              options={["All", "Pending", "Rejected"]}
              onChange={setSubmittedFilter} />
            <span className="t-caption text-muted-foreground ml-1">
              Approved accounts move to the Accounts tab automatically.
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
                  {submittedFilter === "Rejected" ? "No rejected submissions." : "Account submissions will appear here."}
                </p>
              </div>
            ) : (
              <TableGrid>
                <TableHead>
                  <TableGridRow cols="130px 1.8fr 100px 1.4fr 110px 110px 1fr 80px" head>
                    <Th>Account No.</Th>
                    <Th>Account Name</Th>
                    <Th>Type</Th>
                    <Th>Product</Th>
                    <Th>Action</Th>
                    <Th>Status</Th>
                    <Th>Date Submitted</Th>
                    <Th />
                  </TableGridRow>
                </TableHead>
                <TableBody>
                  {rows.map((a) => (
                    <TableGridRow key={a.id} cols="130px 1.8fr 100px 1.4fr 110px 110px 1fr 80px">
                      <Td muted>{a.accountNo ?? "—"}</Td>
                      <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                        <span className="t-body truncate">{a.holderName}</span>
                        {a.cifId && <span className="t-caption text-muted-foreground">CIF {a.cifId}</span>}
                      </div>
                      <Td muted>{a.accountNo ? "Individual" : "—"}</Td>
                      <Td>{a.product}</Td>
                      <div><Badge variant={a.type === "new_account" ? "primary" : "info"}>{a.type === "new_account" ? "New" : "Edit"}</Badge></div>
                      <div><Badge variant={a.status === "rejected" ? "danger" : "warn"}>{a.status === "rejected" ? "Rejected" : "Pending"}</Badge></div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock size={13} strokeWidth={1.75} aria-hidden="true" />
                        <span className="t-caption">{a.submittedAt}</span>
                      </div>
                      <div className="flex items-center justify-end">
                        <Button variant="ghost" size="sm"
                          rightIcon={<Eye size={14} strokeWidth={1.75} aria-hidden="true" />}
                          onClick={() => {
                            if (a.type === "edit_account" && a.accountNo) {
                              // Edit — show the existing account detail + the submission modal for context
                              const detail = getAccount(a.accountNo);
                              if (detail) { setViewing(detail); return; }
                            }
                            setReviewingApproval(a);
                          }}>
                          View
                        </Button>
                      </div>
                    </TableGridRow>
                  ))}
                </TableBody>
              </TableGrid>
            );
          })()}
        </>}

        {/* ── PENDING APPROVAL TAB — checker/admin ── */}
        {tab === "pending" && <>
          {approvalList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <CheckCircle2 size={24} strokeWidth={1.5} className="text-cta" aria-hidden="true" />
              </div>
              <p className="t-body-semi">All caught up</p>
              <p className="t-body text-muted-foreground max-w-xs">No account submissions awaiting your review.</p>
            </div>
          ) : (
            <TableGrid>
              <TableHead>
                <TableGridRow cols="2fr 120px 1.2fr 1fr 80px" head>
                  <Th>Account</Th><Th>Type</Th><Th>Submitted by</Th><Th>Date</Th><Th />
                </TableGridRow>
              </TableHead>
              <TableBody>
                {approvalList.map((a) => (
                  <TableGridRow key={a.id} cols="2fr 120px 1.2fr 1fr 80px">
                    <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                      <span className="t-body-med truncate">{a.holderName}</span>
                      <span className="t-caption text-muted-foreground">{a.accountNo ?? "New account"} · {a.product}</span>
                    </div>
                    <div><Badge variant={a.type === "new_account" ? "primary" : "info"}>{a.type === "new_account" ? "New" : "Edit"}</Badge></div>
                    <Td>{a.submittedBy}</Td>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={13} strokeWidth={1.75} aria-hidden="true" />
                      <span className="t-caption">{a.submittedAt}</span>
                    </div>
                    <div className="flex items-center justify-end">
                      <Button variant="ghost" size="sm" rightIcon={<Eye size={14} strokeWidth={1.75} aria-hidden="true" />}>Review</Button>
                    </div>
                  </TableGridRow>
                ))}
              </TableBody>
            </TableGrid>
          )}
        </>}

      </PageShell>

      {/* Modals */}
      <AccountViewModal account={viewing} onClose={() => setViewing(null)} />
      <AccountEditModal account={editing} onClose={() => setEditing(null)} />

      {/* Account approval review modal */}
      {reviewingApproval && (
        <Modal open={!!reviewingApproval} onClose={() => setReviewingApproval(null)} size="lg">
          <ModalHeader
            title={reviewingApproval.type === "new_account" ? "New Account Request" : "Edit Account Request"}
            description={`${reviewingApproval.holderName}${reviewingApproval.cifId ? ` · CIF ${reviewingApproval.cifId}` : ""}${reviewingApproval.accountNo ? ` · ${reviewingApproval.accountNo}` : ""} · Submitted by ${reviewingApproval.submittedBy} on ${reviewingApproval.submittedAt}`}
            onClose={() => setReviewingApproval(null)}
          />
          <ModalBody>
            <div className="flex flex-col gap-5">

              {/* Status banner */}
              {reviewingApproval.status === "pending" && (
                <Alert variant="info">This submission is awaiting review by a checker.</Alert>
              )}

              {/* Maker's reason */}
              <div className="flex flex-col gap-1.5">
                <span className="t-label text-muted-foreground">
                  {reviewingApproval.type === "new_account" ? "Reason for new account" : "Reason for change"}
                </span>
                <p className="t-body text-foreground bg-muted rounded-md px-4 py-3">{reviewingApproval.reason}</p>
              </div>

              {/* NEW ACCOUNT — show all submitted fields */}
              {reviewingApproval.type === "new_account" && reviewingApproval.fields && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[1fr_2fr] px-4 py-2.5 bg-muted border-b border-border">
                    <span className="t-label text-muted-foreground">Field</span>
                    <span className="t-label text-muted-foreground">Value</span>
                  </div>
                  {Object.entries(reviewingApproval.fields).map(([key, val], i) => (
                    <div key={key} className={`grid grid-cols-[1fr_2fr] px-4 py-3.5 items-start ${i > 0 ? "border-t border-border-light" : ""}`}>
                      <span className="t-body-semi text-primary">{key}</span>
                      <span className="t-body text-foreground">{val}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* EDIT ACCOUNT — show diff table */}
              {reviewingApproval.type === "edit_account" && reviewingApproval.diff && reviewingApproval.diff.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="t-label text-muted-foreground">Changes made</span>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[1.4fr_1fr_1fr] px-4 py-2.5 bg-muted border-b border-border">
                      <span className="t-label text-muted-foreground">Detail changing</span>
                      <span className="t-label text-muted-foreground">From</span>
                      <span className="t-label text-muted-foreground">To</span>
                    </div>
                    {reviewingApproval.diff.map((row, i) => (
                      <div key={row.field} className={`grid grid-cols-[1.4fr_1fr_1fr] px-4 py-3.5 items-start ${i > 0 ? "border-t border-border-light" : ""}`}>
                        <span className="t-body-semi text-primary">{row.field}</span>
                        <span className="t-body text-muted-foreground">{row.from}</span>
                        <span className="t-body text-foreground font-medium">{row.to}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection/approval feedback */}
              {reviewingApproval.checkerComment && (
                <div className="flex flex-col gap-3">
                  <Alert
                    variant={reviewingApproval.status === "rejected" ? "danger" : "success"}
                    title={reviewingApproval.status === "rejected" ? "Reason for rejection" : "Checker's comment"}
                  >
                    {reviewingApproval.checkerComment}
                  </Alert>
                  {(reviewingApproval.reviewedBy || reviewingApproval.reviewedAt) && (
                    <div className="flex items-center gap-6 px-1">
                      {reviewingApproval.reviewedBy && (
                        <div className="flex flex-col gap-0.5">
                          <span className="t-label text-muted-foreground">{reviewingApproval.status === "rejected" ? "Rejected by" : "Approved by"}</span>
                          <span className="t-body">{reviewingApproval.reviewedBy}</span>
                        </div>
                      )}
                      {reviewingApproval.reviewedAt && (
                        <div className="flex flex-col gap-0.5">
                          <span className="t-label text-muted-foreground">{reviewingApproval.status === "rejected" ? "Rejected on" : "Approved on"}</span>
                          <span className="t-body">{reviewingApproval.reviewedAt}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter className="justify-between">
            <Button variant="ghost" size="md" onClick={() => setReviewingApproval(null)}>Close</Button>
            {reviewingApproval.status === "rejected" && (
              <Button variant="primary" size="md"
                leftIcon={<Pencil size={15} strokeWidth={1.75} aria-hidden="true" />}
                onClick={() => {
                  setReviewingApproval(null);
                  if (reviewingApproval.type === "edit_account" && reviewingApproval.accountNo) {
                    const detail = getAccount(reviewingApproval.accountNo);
                    if (detail) setEditing(detail);
                  }
                  // new_account → TODO: open new account form prefilled
                }}>
                Edit & Resubmit
              </Button>
            )}
          </ModalFooter>
        </Modal>
      )}

      <ConfirmModal
        open={!!discardDraft}
        onClose={() => setDiscardDraft(null)}
        onConfirm={() => { setDraftList((p) => p.filter((d) => d.draftId !== discardDraft?.draftId)); setDiscardDraft(null); }}
        title="Discard draft?"
        description={discardDraft ? `Discard the draft for "${discardDraft.holderName ?? "this account"}"? This cannot be undone.` : ""}
        confirmLabel="Yes, discard"
        cancelLabel="Cancel"
        variant="danger"
      />
    </>
  );
}
