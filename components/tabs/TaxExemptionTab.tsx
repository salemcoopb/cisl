import { ReceiptText } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Alert } from "../ui/Alert";
import { Card, CardBody } from "../ui/Card";
import { SectionTitle } from "../ProfileField";
import type { Customer } from "../../data/customers";

export function TaxExemptionTab({ customer }: { customer: Customer }) {
  return (
    <div className="max-w-5xl flex flex-col gap-5">
      <SectionTitle icon={ReceiptText}>Tax Status Information</SectionTitle>

      <Alert variant="info">
        Indicates whether this customer is exempt from tax and any supporting documentation on file.
      </Alert>

      <Card>
        <CardBody className="flex items-center justify-between gap-4 py-3">
          <span className="t-body">Are you exempted from tax?</span>
          {customer.taxExempt ? (
            <Badge variant="success">Yes — Exempt</Badge>
          ) : (
            <Badge variant="neutral">No</Badge>
          )}
        </CardBody>
      </Card>

      {customer.taxExempt && customer.taxNote && (
        <Alert variant="success" title="Exemption Details">
          {customer.taxNote}
        </Alert>
      )}
    </div>
  );
}
