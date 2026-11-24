import { useState, useMemo } from "react";
import {
  Landmark, User, FileText, ArrowDownUp,
  Download, Shield, CreditCard, Smartphone, Lock,
} from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalTabBar, ModalTab } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Card, CardHeader, CardBody } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Alert } from "./ui/Alert";
import { Input } from "./ui/Input";
import { TableGrid, TableHead, TableBody, TableGridRow, Th, Td, TableEmpty } from "./ui/Table";
import { Dropdown } from "./Dropdown";
import { useToast } from "./ui/Toast";
import { getCustomer, fullName } from "../data/customers";
import { kes } from "../lib/format";
import { useSortable } from "../lib/useSortable";
import { AddLienModal } from "../screens/AccountLien";
import type { AccountDetail } from "../data/accounts";

type AccountTab = "overview" | "transactions";

/* ─── Field helper ───────────────────────────────────────────────── */
function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500, color: "#A8A7A1" }}>{label}</span>
      <span className="t-body text-foreground">{value ?? "—"}</span>
    </div>
  );
}

function FieldCard({ icon, title, cols = 2, children }: {
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

/* ─── Transactions tab ───────────────────────────────────────────── */
const TXN_COLS = "1.2fr 80px 1fr 1.4fr 1.2fr 80px 1.8fr";

function TransactionsTab({ account }: { account: AccountDetail }) {
  const toast = useToast();
  const [search, setSearch]   = useState("");
  const [typeFilter, setType] = useState("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return account.transactions.filter((t) => {
      if (q && !`${t.narration} ${t.reference}`.toLowerCase().includes(q)) return false;
      if (typeFilter !== "All" && t.type !== typeFilter) return false;
      return true;
    });
  }, [account.transactions, search, typeFilter]);

  const { sorted: sortedTxns, sortKey, sortDir, toggleSort } = useSortable(
    filtered as unknown as Record<string, unknown>[],
    "date"
  );

  function downloadCsv() {
    const header = "Date,Type,Amount,Reference,Running Balance,Currency,Narration";
    const rows = filtered.map((t) =>
      `${t.date},${t.type},${t.amount},${t.reference},${t.runningBalance},${t.currency},"${t.narration}"`
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${account.accountNo}-transactions.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ variant: "success", title: "CSV downloaded", description: `${filtered.length} transactions exported.` });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters + Download */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1">
          <Input placeholder="Search narration or reference…" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Dropdown label="Type" value={typeFilter} options={["All","CR","DR"]} onChange={setType} />
        <Button variant="secondary" size="md"
          leftIcon={<Download size={15} strokeWidth={1.75} aria-hidden="true" />}
          onClick={downloadCsv}>
          Download CSV
        </Button>
      </div>

      {/* Table */}
      <TableGrid>
        <TableHead>
          <TableGridRow cols={TXN_COLS} head>
            <Th sort={sortKey === "date" ? sortDir : null} onSort={() => toggleSort("date")}>Date</Th>
            <Th>Type</Th>
            <Th sort={sortKey === "amount" ? sortDir : null} onSort={() => toggleSort("amount")}>Amount</Th>
            <Th>Reference Number</Th>
            <Th sort={sortKey === "runningBalance" ? sortDir : null} onSort={() => toggleSort("runningBalance")}>Running Balance</Th>
            <Th>Currency</Th>
            <Th>Narration</Th>
          </TableGridRow>
        </TableHead>
        <TableBody>
          {sortedTxns.length === 0 ? (
            <TableEmpty>No transactions match your filters.</TableEmpty>
          ) : (sortedTxns as unknown as typeof filtered).map((t, i) => (
            <TableGridRow key={i} cols={TXN_COLS}>
              <Td muted className="t-caption">{t.date}</Td>
              <div>
                <Badge variant={t.type === "CR" ? "success" : "pending"}>{t.type}</Badge>
              </div>
              <span className={`t-body-med tabular-nums ${t.type === "CR" ? "text-success-fg" : "text-danger-fg"}`}>
                {t.type === "CR" ? "+" : "−"}{t.amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
              </span>
              <Td muted className="t-caption truncate">{t.reference}</Td>
              <Td className="tabular-nums">{t.runningBalance.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</Td>
              <Td muted>{t.currency}</Td>
              <Td muted className="truncate">{t.narration}</Td>
            </TableGridRow>
          ))}
        </TableBody>
      </TableGrid>
      <span className="t-caption text-muted-foreground">{sortedTxns.length} transaction{sortedTxns.length !== 1 ? "s" : ""}</span>
    </div>
  );
}

/* ─── Main modal ─────────────────────────────────────────────────── */
interface AccountViewModalProps {
  account: AccountDetail | null;
  onClose: () => void;
}

export function AccountViewModal({ account, onClose }: AccountViewModalProps) {
  const [tab, setTab]       = useState<AccountTab>("overview");
  const [addingLien, setAddingLien] = useState(false);

  if (!account) return null;

  const customer = account.cifId ? getCustomer(account.cifId) : undefined;

  return (
    <>
      <Modal open={!!account} onClose={onClose} size="xl">
        <ModalHeader
          title={account.accountNo}
          description={`${account.product} · ${account.holderName} · Opened ${account.opened}`}
          adornment={
            <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Landmark size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" />
            </span>
          }
          actions={
            <Button variant="secondary" size="sm"
              leftIcon={<Lock size={14} strokeWidth={1.75} aria-hidden="true" />}
              onClick={() => setAddingLien(true)}>
              Add lien
            </Button>
          }
          onClose={onClose}
        />

        <ModalTabBar>
          <ModalTab active={tab === "overview"} onClick={() => setTab("overview")}>
            <Landmark size={14} strokeWidth={1.75} aria-hidden="true" /> Overview
          </ModalTab>
          <ModalTab active={tab === "transactions"} onClick={() => setTab("transactions")}
            badge={account.transactions.length}>
            <ArrowDownUp size={14} strokeWidth={1.75} aria-hidden="true" /> Transactions
          </ModalTab>
        </ModalTabBar>

        <ModalBody flush>
          <div className="px-6 py-5 flex flex-col gap-5">

            {tab === "overview" && <>
              {/* ── Balance tiles ── */}
              <div className="grid grid-cols-4 gap-3.5">
                {/* Investment Balance — deep primary green gradient */}
                <div className="relative rounded-xl overflow-hidden px-5 py-4 flex flex-col gap-3 min-h-[110px]"
                  style={{ background: "linear-gradient(135deg, #004E38 0%, #006B4F 50%, #005A42 100%)" }}>
                  <div className="absolute inset-0 opacity-10"
                    style={{ background: "radial-gradient(ellipse at 80% 20%, #75AF0F 0%, transparent 60%)" }} />
                  <span className="t-label text-white/70 relative z-10">Investment Balance</span>
                  <span className="t-heading text-white tabular-nums relative z-10">{kes(account.investmentBalance)}</span>
                </div>

                {/* Deposit Balance — warm gold gradient */}
                <div className="relative rounded-xl overflow-hidden px-5 py-4 flex flex-col gap-3 min-h-[110px]"
                  style={{ background: "linear-gradient(135deg, #8B6914 0%, #C7A034 50%, #A07C20 100%)" }}>
                  <div className="absolute inset-0 opacity-15"
                    style={{ background: "radial-gradient(ellipse at 20% 80%, #fff 0%, transparent 60%)" }} />
                  <span className="t-label text-white/70 relative z-10">Deposit Balance</span>
                  <span className="t-heading text-white tabular-nums relative z-10">{kes(account.depositBalance)}</span>
                </div>

                {/* Lien Amount — slate/muted gradient */}
                <div className="relative rounded-xl overflow-hidden px-5 py-4 flex flex-col gap-3 min-h-[110px]"
                  style={{ background: "linear-gradient(135deg, #3a3a38 0%, #5a5a56 50%, #4a4a46 100%)" }}>
                  <div className="absolute inset-0 opacity-10"
                    style={{ background: "radial-gradient(ellipse at 80% 80%, #fff 0%, transparent 60%)" }} />
                  <span className="t-label text-white/70 relative z-10">Lien Amount</span>
                  <span className="t-heading text-white tabular-nums relative z-10">{kes(account.lienAmount)}</span>
                  {account.lienAmount > 0 && (
                    <span className="absolute top-3 right-3 z-10">
                      <Lock size={14} strokeWidth={1.75} className="text-white/60" aria-hidden="true" />
                    </span>
                  )}
                </div>

                {/* Total Balance — lime CTA gradient (summary/featured) */}
                <div className="relative rounded-xl overflow-hidden px-5 py-4 flex flex-col gap-3 min-h-[110px]"
                  style={{ background: "linear-gradient(135deg, #4A700A 0%, #75AF0F 50%, #5C8A0C 100%)" }}>
                  <div className="absolute inset-0 opacity-15"
                    style={{ background: "radial-gradient(ellipse at 30% 10%, #fff 0%, transparent 55%)" }} />
                  <span className="t-label text-white/70 relative z-10">Total Balance</span>
                  <span className="t-heading text-white tabular-nums relative z-10">{kes(account.totalBalance)}</span>
                </div>
              </div>

              {/* ── Account + Customer info ── */}
              <div className="grid grid-cols-2 gap-5">
                <FieldCard icon={<Landmark size={15} strokeWidth={2} aria-hidden="true" />} title="Investment Account Information">
                  <Field label="Account Number" value={account.accountNo} />
                  <Field label="Account Holder" value={account.holderName} />
                  <Field label="Account Type"   value={account.accountType} />
                  <Field label="Product"        value={account.product} />
                  <Field label="Currency"       value={account.currency} />
                  <Field label="Opening Date"   value={account.opened} />
                </FieldCard>

                <FieldCard icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Customer Information">
                  <Field label="Full Name"  value={customer ? fullName(customer) : account.holderName} />
                  <Field label="CIF"        value={account.cifId} />
                  <Field label="Email"      value={customer?.emailMasked} />
                  <Field label="ID Number"  value={customer?.idMasked} />
                  <Field label="Phone"      value={customer?.phoneMasked} />
                  <Field label="KYC Status" value={account.kyc} />
                </FieldCard>
              </div>

              {/* ── Signing instructions ── */}
              <FieldCard icon={<FileText size={15} strokeWidth={2} aria-hidden="true" />} title="Signing Instructions" cols={4}>
                <div className="col-span-4">
                  <span className="t-body text-foreground">{account.signingInstructions ?? "Not specified"}</span>
                </div>
              </FieldCard>

              {/* ── Withdrawal details ── */}
              <Card>
                <CardHeader icon={<CreditCard size={15} strokeWidth={2} aria-hidden="true" />} title="Withdrawal Details" />
                <div className="px-5 py-5 flex flex-col gap-5">
                  {!account.primaryWithdrawal ? (
                    <span className="t-body text-muted-foreground">No withdrawal details on file.</span>
                  ) : (
                    [
                      { slot: account.primaryWithdrawal,   slotLabel: "Primary"   },
                      { slot: account.secondaryWithdrawal, slotLabel: "Secondary" },
                    ].filter(({ slot }) => !!slot).map(({ slot, slotLabel }, idx) => (
                      <div key={slotLabel} className={`flex flex-col gap-4 ${idx > 0 ? "pt-5 border-t border-border" : ""}`}>
                        {/* Method header + Primary/Secondary badge */}
                        <div className="flex items-center gap-2.5">
                          {slot!.method === "bank"
                            ? <CreditCard size={14} strokeWidth={1.75} className="text-muted-foreground" aria-hidden="true" />
                            : <Smartphone size={14} strokeWidth={1.75} className="text-muted-foreground" aria-hidden="true" />}
                          <span className="t-body-semi">{slot!.method === "bank" ? "Bank Transfer" : "Mobile Money"}</span>
                          <span className={`t-label px-2 py-0.5 rounded-sm ${slotLabel === "Primary" ? "bg-primary/10 text-primary" : "bg-panel text-muted-foreground"}`}>
                            {slotLabel}
                          </span>
                        </div>

                        {slot!.method === "bank" ? (
                          <>
                            <div className="grid grid-cols-4 gap-x-8 gap-y-4">
                              <Field label="Bank Name"           value={slot.bankName} />
                              <Field label="Bank Account Number" value={slot.accountNumber} />
                              <Field label="Bank Code"           value={slot.bankCode} />
                              <Field label="SWIFT Code"          value={slot.swiftCode} />
                              <Field label="Branch"              value={slot.branch} />
                              <Field label="Branch Code"         value={slot.branchCode} />
                              <Field label="Account Name"        value={slot.accountName} />
                            </div>
                            <div className="pt-3 border-t border-border-light">
                              <span className="t-label text-muted-foreground mb-3 block">Bank Address</span>
                              <div className="grid grid-cols-4 gap-x-8 gap-y-4">
                                <div className="col-span-4"><Field label="Address Line 1" value={slot.addressLine1} /></div>
                                <Field label="City"           value={slot.city} />
                                <Field label="Country"        value={slot.country} />
                                <Field label="Postal Address" value={slot.postalAddress} />
                                <Field label="Postal Code"    value={slot.postalCode} />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="grid grid-cols-4 gap-x-8 gap-y-4">
                            <Field label="Provider"     value={slot.provider} />
                            <Field label="Phone Number" value={slot.phoneNumber} />
                            <Field label="Name"         value={slot.accountName} />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </>}

            {tab === "transactions" && (
              <TransactionsTab account={account} />
            )}

          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" size="md" onClick={onClose}>Close</Button>
        </ModalFooter>
      </Modal>

      {addingLien && (
        <AddLienModal
          open={addingLien}
          prefillAccountNo={account.accountNo}
          onClose={() => setAddingLien(false)}
        />
      )}
    </>
  );
}
