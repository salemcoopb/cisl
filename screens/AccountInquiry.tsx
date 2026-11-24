import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, ArrowRight, Clock3, Wallet } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Avatar } from "../components/ui/Avatar";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { StatTile } from "../components/ui/StatTile";
import { PageShell } from "../components/ui/PageShell";
import { TableGrid, TableHead, TableBody, TableGridRow, Th, Td } from "../components/ui/Table";
import { getAccount, accounts, recentAccounts } from "../data/accounts";
import type { AccountTxn } from "../data/accounts";
import { kes, signedKes } from "../lib/format";

const HOLD_COLS = "2fr 1fr 1fr 56px";

function txnVariant(s: AccountTxn["status"]) {
  return s === "Settled" ? "success" : s === "Pending" ? "warn" : "pending";
}

export function AccountInquiry() {
  const { accountNo } = useParams<{ accountNo: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState(accountNo ?? "");
  const account = accountNo ? getAccount(accountNo) : undefined;

  const runSearch = () => {
    const key = query.trim().toUpperCase();
    if (accounts[key]) navigate(`/account-inquiry/${key}`);
  };

  return (
    <>
      <TopBar
        crumbs={[
          { label: "Account Maintenance" },
          account
            ? { label: "Account Inquiry", to: "/account-inquiry" }
            : { label: "Account Inquiry" },
          ...(account ? [{ label: account.accountNo }] : []),
        ]}
      />
      <PageShell>
        {/* Search bar */}
        <Input
          placeholder="Search by account number, customer name, or ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          leftSlot={<Search size={16} strokeWidth={1.75} />}
          rightSlot={
            <Button variant="primary" size="sm" onClick={runSearch}>
              Search
            </Button>
          }
        />

        {account ? (
          <>
            {/* Account hero card */}
            <Card className="mt-5">
              <CardBody className="flex items-center gap-4">
                <Avatar
                  initials={account.holderName.slice(0, 2)}
                  size="md"
                  shape="rounded"
                />
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="t-heading">{account.holderName}</span>
                    <Badge variant="success" dot>{account.status}</Badge>
                    <Badge variant="warn">{account.kyc}</Badge>
                  </div>
                  <span className="t-caption text-muted-foreground">
                    {account.accountNo} · {account.type} · RM: {account.rm} · Opened {account.opened}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-2.5 shrink-0">
                  <Button variant="secondary" size="md">View statement</Button>
                  <Button variant="primary"  size="md">New instruction</Button>
                </div>
              </CardBody>
            </Card>

            {/* KPI tiles */}
            <div className="grid grid-cols-4 gap-3.5 mt-3.5">
              {[
                { label: "Total portfolio value", value: account.totalValue },
                { label: "Available cash",        value: account.availableCash },
                { label: "Invested amount",        value: account.invested },
                { label: "Accrued interest",       value: account.accruedInterest },
              ].map((tile) => (
                <StatTile key={tile.label} label={tile.label} value={kes(tile.value)} />
              ))}
            </div>

            {/* Holdings + Transactions */}
            <div className="grid grid-cols-[1.55fr_1fr] gap-4 mt-4">
              {/* Holdings */}
              <Card>
                <CardHeader
                  title="Holdings & balances"
                  action={
                    <button className="t-caption text-cta-hover font-medium hover:underline">View all</button>
                  }
                />
                <TableGrid className="border-0 rounded-none">
                  <TableHead>
                    <TableGridRow cols={HOLD_COLS} head className="border-b-0">
                      <Th>Instrument</Th>
                      <Th>Type</Th>
                      <Th align="right">Value (KES)</Th>
                      <Th align="right">%</Th>
                    </TableGridRow>
                  </TableHead>
                  <TableBody>
                    {account.holdings.map((h, i) => (
                      <TableGridRow
                        key={h.instrument}
                        cols={HOLD_COLS}
                        className={i === 0 ? "border-t-0" : ""}
                      >
                        <Td>{h.instrument}</Td>
                        <Td muted>{h.type}</Td>
                        <Td align="right" className="tabular-nums">{h.value.toLocaleString("en-KE")}</Td>
                        <Td align="right" muted>{h.pct}%</Td>
                      </TableGridRow>
                    ))}
                  </TableBody>
                </TableGrid>
              </Card>

              {/* Transactions */}
              <Card>
                <CardHeader
                  title="Recent transactions"
                  action={
                    <button className="t-caption text-cta-hover font-medium hover:underline">View all</button>
                  }
                />
                {account.transactions.map((t, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-4 py-3 ${
                      i < account.transactions.length - 1 ? "border-b border-border-light" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <span className="t-body truncate">{t.desc}</span>
                      <span className="t-caption text-muted-foreground">
                        {t.date} · {t.category}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="t-body-med tabular-nums">{signedKes(t.amount)}</span>
                      <Badge variant={txnVariant(t.status)}>{t.status}</Badge>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </>
        ) : (
          <div className="mt-8 flex flex-col items-center">
            {accountNo ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Search size={28} strokeWidth={1.5} className="text-muted-foreground" />
                <p className="t-body-med">No account found for "{accountNo}"</p>
                <p className="t-body text-muted-foreground">Check the account number and try again.</p>
              </div>
            ) : (
              <div className="w-full max-w-xl">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <Clock3 size={15} strokeWidth={1.75} aria-hidden="true" />
                  <span className="t-label">Recently viewed</span>
                </div>
                <Card>
                  {recentAccounts.map((no, i) => {
                    const acc = getAccount(no)!;
                    return (
                      <button
                        key={no}
                        onClick={() => navigate(`/account-inquiry/${no}`)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted transition-colors ${
                          i < recentAccounts.length - 1 ? "border-b border-border-light" : ""
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-panel flex items-center justify-center shrink-0">
                          <Wallet size={16} strokeWidth={1.75} className="text-gold" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="t-body-med truncate">{acc.holderName}</span>
                          <span className="t-caption text-muted-foreground">
                            {acc.accountNo} · {acc.type}
                          </span>
                        </div>
                        <span className="t-body-semi tabular-nums mr-2">{kes(acc.totalValue)}</span>
                        <ArrowRight size={16} className="text-muted-foreground" aria-hidden="true" />
                      </button>
                    );
                  })}
                </Card>
              </div>
            )}
          </div>
        )}
      </PageShell>
    </>
  );
}
