import { useState } from "react";
import { UsersRound, UserPlus } from "lucide-react";
import { TableGrid, TableHead, TableBody, TableGridRow, Th, Td } from "../ui/Table";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { SectionTitle } from "../ProfileField";
import { useToast } from "../ui/Toast";
import type { Customer } from "../../data/customers";

const COLS = "90px 1fr 1fr 1.1fr 1.2fr 1.4fr";

function FormSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="t-label text-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-md border border-border bg-background px-3.5 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function AddBeneficiaryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [saving, setSaving]           = useState(false);
  const [salutation, setSalutation]   = useState("Mr");
  const [firstName, setFirstName]     = useState("");
  const [lastName, setLastName]       = useState("");
  const [relationship, setRelationship] = useState("");
  const [mobile, setMobile]           = useState("");
  const [email, setEmail]             = useState("");

  function reset() {
    setSalutation("Mr"); setFirstName(""); setLastName("");
    setRelationship(""); setMobile(""); setEmail("");
  }

  function handleClose() { reset(); onClose(); }

  function handleSubmit() {
    if (!firstName || !lastName || !relationship) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({
        variant: "success",
        title: "Submitted for approval",
        description: `${firstName} ${lastName} has been submitted as a new beneficiary for checker review.`,
      });
      handleClose();
    }, 600);
  }

  const valid = firstName.trim() && lastName.trim() && relationship.trim();

  return (
    <Modal open={open} onClose={handleClose} size="md" disableBackdropClose={saving}>
      <ModalHeader
        title="Add Beneficiary"
        description="This will be submitted to a checker for approval"
        onClose={handleClose}
      />
      <ModalBody>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <FormSelect label="Salutation" value={salutation} options={["Mr","Mrs","Ms","Dr","Prof"]} onChange={setSalutation} />
          <div /> {/* spacer */}
          <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label="Last Name"  value={lastName}  onChange={(e) => setLastName(e.target.value)} />
          <Input label="Relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="e.g. Spouse, Son, Daughter" />
          <Input label="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+254 7xx xxx xxx" />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" size="md" onClick={handleClose} disabled={saving}>Cancel</Button>
        <Button variant="primary" size="md" loading={saving} disabled={!valid} onClick={handleSubmit}>
          Submit for approval
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export function BeneficiariesTab({ customer }: { customer: Customer }) {
  const list = customer.beneficiaries;
  const [adding, setAdding] = useState(false);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle icon={UsersRound}>Beneficiaries</SectionTitle>
        <Button
          variant="primary"
          size="md"
          leftIcon={<UserPlus size={15} strokeWidth={1.75} aria-hidden="true" />}
          onClick={() => setAdding(true)}
        >
          Add beneficiary
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="border border-border rounded-lg flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <UsersRound size={22} strokeWidth={1.75} className="text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="t-body-med">No beneficiaries added yet</p>
          <p className="t-body text-muted-foreground max-w-xs">
            Record who this customer's holdings pass to. Beneficiaries appear here once added.
          </p>
        </div>
      ) : (
        <TableGrid>
          <TableHead>
            <TableGridRow cols={COLS} head>
              <Th>Salutation</Th>
              <Th>First Name</Th>
              <Th>Last Name</Th>
              <Th>Relationship</Th>
              <Th>Mobile</Th>
              <Th>Email</Th>
            </TableGridRow>
          </TableHead>
          <TableBody>
            {list.map((b, i) => (
              <TableGridRow key={i} cols={COLS}>
                <Td>{b.salutation}</Td>
                <Td>{b.firstName}</Td>
                <Td>{b.lastName}</Td>
                <Td>{b.relationship}</Td>
                <Td muted>{b.mobile}</Td>
                <Td muted className="truncate">{b.email}</Td>
              </TableGridRow>
            ))}
          </TableBody>
        </TableGrid>
      )}

      <AddBeneficiaryModal open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}
