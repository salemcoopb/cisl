import { ShieldAlert, Check } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Alert } from "../ui/Alert";
import { Card, CardBody } from "../ui/Card";
import { SectionTitle } from "../ProfileField";
import type { Customer } from "../../data/customers";

export function PepDetailsTab({ customer }: { customer: Customer }) {
  const { pepAnswers } = customer;
  const questions = [
    { q: "Do you have any political affiliation?",    a: pepAnswers.politicalAffiliation },
    { q: "Do you hold or have held a public office?", a: pepAnswers.publicOffice },
    { q: "Do you currently hold a political position?", a: pepAnswers.currentPosition },
  ];
  const anyYes = questions.some((x) => x.a);

  return (
    <div className="max-w-5xl flex flex-col gap-5">
      <SectionTitle icon={ShieldAlert}>Politically Exposed Person (PEP) Details</SectionTitle>

      <Alert variant={anyYes ? "warn" : "info"}>
        {anyYes
          ? "This customer is flagged as a Politically Exposed Person. Enhanced due diligence applies."
          : "Declared political affiliations and public-office history for this customer."}
      </Alert>

      <div className="grid grid-cols-2 gap-4">
        {questions.map((x, i) => (
          <Card key={i}>
            <CardBody className="flex items-center justify-between gap-4 py-3">
              <span className="t-body">{x.q}</span>
              {x.a ? (
                <Badge variant="warn">
                  <Check size={12} strokeWidth={2.5} aria-hidden="true" /> Yes
                </Badge>
              ) : (
                <Badge variant="neutral">No</Badge>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {pepAnswers.details && (
        <Alert variant="warn" title="Due Diligence Notes">
          {pepAnswers.details}
        </Alert>
      )}
    </div>
  );
}
