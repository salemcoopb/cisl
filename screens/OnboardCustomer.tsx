import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, UserPlus, Users, Building2, ChevronRight, ArrowLeft } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { PageShell } from "../components/ui/PageShell";
import { Button } from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";
import { IndividualJourney } from "../components/onboarding/IndividualJourney";
import { JointJourney } from "../components/onboarding/JointJourney";
import type { Customer } from "../data/customers";

/* ─── Account type selection landing ────────────────────────────── */
interface AccountTypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
  onClick: () => void;
}

function AccountTypeCard({ icon, title, description, tags, onClick }: AccountTypeCardProps) {
  return (
    <button
      onClick={onClick}
      className="text-left w-full border border-border rounded-xl p-5 hover:border-cta hover:bg-muted/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta group"
    >
      <div className="flex flex-col gap-4">
        {/* Icon + chevron row */}
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-xl bg-gold flex items-center justify-center shrink-0">
            <span className="text-white">{icon}</span>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-muted-foreground group-hover:text-cta mt-0.5 transition-colors" aria-hidden="true" />
        </div>
        {/* Text */}
        <div className="flex flex-col gap-1.5">
          <span className="t-subheading">{title}</span>
          <span className="t-body text-muted-foreground line-clamp-2">{description}</span>
        </div>
        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {tags.map((tag) => (
            <span key={tag} className="t-label px-2.5 py-1 rounded-full bg-primary/8 text-primary border border-primary/15">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

/* ─── Main screen ────────────────────────────────────────────────── */
type AccountType = "individual" | "joint" | "corporate";
type IndividualPath = "new" | "existing";

export function OnboardCustomer() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? {}) as Record<string, unknown>;
  const existingCustomer: Customer | undefined = locationState.customer as Customer | undefined;
  const jointReturn = !!locationState.jointReturn;

  // When returning from joint account flow to create a new customer,
  // auto-start the individual new customer journey immediately
  const [accountType, setAccountType] = useState<AccountType | null>(
    existingCustomer || jointReturn ? "individual" : null
  );
  const [individualPath, setIndividualPath] = useState<IndividualPath | null>(
    existingCustomer ? "existing" : jointReturn ? "new" : null
  );
  const [journeyStarted, setJourneyStarted] = useState(!!(existingCustomer || jointReturn));
  const [jointStarted, setJointStarted] = useState(false);

  function handleBack() {
    if (jointStarted) { setJointStarted(false); return; }
    if (journeyStarted && !existingCustomer) { setJourneyStarted(false); return; }
    if (individualPath && !existingCustomer) { setIndividualPath(null); return; }
    if (accountType && !existingCustomer) { setAccountType(null); return; }
    navigate(-1);
  }

  const showJourney = journeyStarted && accountType === "individual" && individualPath !== null;
  const showJoint   = jointStarted && accountType === "joint";

  return (
    <>
      <TopBar
        crumbs={[
          { label: "Account Maintenance" },
          { label: "Onboard Customer", to: "/onboard-customer" },
          ...(showJourney ? [{ label: individualPath === "new" ? "New Customer" : "Existing Customer" }] : []),
          ...(showJoint ? [{ label: "Joint Account" }] : []),
        ]}
      />
      <PageShell>
        {/* Back — only show when inside a journey */}
        {(showJourney && !existingCustomer) || showJoint ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground t-body mb-5 transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={1.75} aria-hidden="true" />
            Back
          </button>
        ) : null}

        {/* ── Pre-journey: account type + path chooser (progressive disclosure) ── */}
        {!showJourney && !showJoint && (
          <div>
            <div className="mb-6">
              <h1 className="t-title mb-1">Onboard Customer</h1>
              <p className="t-body text-muted-foreground">Select the account type to get started.</p>
            </div>

            {/* Account type cards — always visible */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: "individual" as AccountType, icon: <User size={20} strokeWidth={1.75} />, title: "Individual Account", description: "A single-owner investment account for personal wealth management and growth.", tags: ["Single ownership", "Complete control"] },
                { key: "joint" as AccountType, icon: <Users size={20} strokeWidth={1.75} />, title: "Joint Account", description: "A shared investment account held by two or more individuals with joint decision-making.", tags: ["Multiple holders", "Shared responsibility"] },
                { key: "corporate" as AccountType, icon: <Building2 size={20} strokeWidth={1.75} />, title: "Corporate Account", description: "An investment account opened on behalf of a registered business or organisation.", tags: ["Business entity", "Multiple signatories"] },
              ].map((card) => (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => { setAccountType(card.key); setIndividualPath(null); }}
                  className={[
                    "text-left w-full rounded-2xl border-2 p-5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta",
                    accountType === card.key
                      ? "border-cta ring-2 ring-cta/20 bg-cta/5"
                      : "border-border hover:border-cta/40 hover:bg-muted/20",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-xl bg-gold flex items-center justify-center shrink-0">
                        <span className="text-white">{card.icon}</span>
                      </div>
                      {/* Selection indicator */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5 ${accountType === card.key ? "border-cta bg-cta" : "border-border"}`}>
                        {accountType === card.key && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="t-subheading">{card.title}</span>
                      <span className="t-body text-muted-foreground line-clamp-2">{card.description}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {card.tags.map((tag) => (
                        <span key={tag} className="t-label px-2.5 py-1 rounded-full bg-primary/8 text-primary border border-primary/15">{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Individual sub-options — reveal when individual is selected */}
            {accountType === "individual" && (
              <div className="mt-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="t-label text-muted-foreground px-2">How would you like to proceed?</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "new" as IndividualPath, icon: <User size={18} strokeWidth={1.75} />, title: "New customer", description: "Create a new customer profile and open an investment account in one journey.", tags: ["New CIF", "Full onboarding"] },
                    { key: "existing" as IndividualPath, icon: <Users size={18} strokeWidth={1.75} />, title: "Existing customer", description: "Find a customer already in the system and open a new investment account.", tags: ["Existing CIF", "Account only"] },
                  ].map((card) => (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => { setIndividualPath(card.key); setJourneyStarted(true); }}
                      className="text-left rounded-xl border border-border bg-muted/30 px-5 py-4 hover:border-cta hover:bg-cta/5 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta group"
                    >
                      <div className="flex items-center gap-4">
                        {/* smaller, plainer icon — clearly subordinate */}
                        <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 group-hover:border-cta/40 transition-colors">
                          <span className="text-primary group-hover:text-cta transition-colors">{card.icon}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="t-body-semi">{card.title}</span>
                          <span className="t-caption text-muted-foreground line-clamp-1">{card.description}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            {card.tags.map((tag) => (
                              <span key={tag} className="t-label px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <ChevronRight size={15} strokeWidth={1.75} className="text-muted-foreground group-hover:text-cta shrink-0 transition-colors" aria-hidden="true" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Joint — single action card, starts journey immediately */}
            {accountType === "joint" && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setJointStarted(true)}
                  className="text-left rounded-xl border border-border bg-muted/30 px-5 py-4 hover:border-cta hover:bg-cta/5 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 group-hover:border-cta/40 transition-colors">
                      <Users size={18} strokeWidth={1.75} className="text-primary group-hover:text-cta transition-colors" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="t-body-semi">Start joint account journey</span>
                      <span className="t-caption text-muted-foreground line-clamp-1">Add holders, select a fund, and configure signing instructions.</span>
                    </div>
                    <ChevronRight size={15} strokeWidth={1.75} className="text-muted-foreground group-hover:text-cta shrink-0 transition-colors" aria-hidden="true" />
                  </div>
                </button>
              </div>
            )}

            {/* Corporate — coming soon */}
            {accountType === "corporate" && (
              <div className="mt-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="t-label text-muted-foreground px-2">Coming soon</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <Card>
                  <CardBody>
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                      <UserPlus size={26} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />
                      <p className="t-body-semi">Not yet available</p>
                      <p className="t-body text-muted-foreground max-w-xs">The corporate account journey is coming soon.</p>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ── Individual journey — stepper starts here ── */}
        {showJourney && (
          <IndividualJourney
            existingCustomer={existingCustomer}
            isNewCustomer={individualPath === "new"}
          />
        )}

        {/* ── Joint journey — stepper starts here ── */}
        {showJoint && <JointJourney />}
      </PageShell>
    </>
  );
}
