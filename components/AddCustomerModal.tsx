import { useState } from "react";
import { User, Phone, MapPin, Briefcase } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card, CardHeader } from "./ui/Card";
import { useToast } from "./ui/Toast";

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

function Section({ icon, title, cols = 4, children }: {
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

export function AddCustomerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const [salutation, setSalutation]       = useState("Mr");
  const [firstName, setFirstName]         = useState("");
  const [middleName, setMiddleName]       = useState("");
  const [lastName, setLastName]           = useState("");
  const [gender, setGender]               = useState("Male");
  const [dob, setDob]                     = useState("");
  const [customerType, setCustomerType]   = useState("Individual");
  const [idType, setIdType]               = useState("NATID");
  const [idNumber, setIdNumber]           = useState("");
  const [kraNumber, setKraNumber]         = useState("");
  const [phone, setPhone]                 = useState("");
  const [altPhone, setAltPhone]           = useState("");
  const [email, setEmail]                 = useState("");
  const [altEmail, setAltEmail]           = useState("");
  const [nationality, setNationality]     = useState("");
  const [countryOfRes, setCountryOfRes]   = useState("");
  const [city, setCity]                   = useState("");
  const [address, setAddress]             = useState("");
  const [postalAddress, setPostalAddress] = useState("");
  const [postalCode, setPostalCode]       = useState("");
  const [occupation, setOccupation]       = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState("");

  function reset() {
    setSalutation("Mr"); setFirstName(""); setMiddleName(""); setLastName("");
    setGender("Male"); setDob(""); setCustomerType("Individual");
    setIdType("NATID"); setIdNumber(""); setKraNumber("");
    setPhone(""); setAltPhone(""); setEmail(""); setAltEmail("");
    setNationality(""); setCountryOfRes(""); setCity("");
    setAddress(""); setPostalAddress(""); setPostalCode("");
    setOccupation(""); setMonthlyIncome(""); setSourceOfFunds("");
  }

  function handleClose() { reset(); onClose(); }

  const valid = firstName.trim() && lastName.trim() && phone.trim() && idNumber.trim();

  function handleSubmit() {
    if (!valid) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({
        variant: "success",
        title: "Submitted for approval",
        description: `${firstName} ${lastName}'s new customer record has been submitted to a checker.`,
      });
      handleClose();
    }, 700);
  }

  return (
    <Modal open={open} onClose={handleClose} size="xl" disableBackdropClose={saving}>
      <ModalHeader
        title="New Customer"
        description="Fill in the details below. The record will be submitted to a checker for approval."
        onClose={handleClose}
      />
      <ModalBody flush>
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Personal Information — includes identification */}
          <Section icon={<User size={15} strokeWidth={2} aria-hidden="true" />} title="Personal Information">
            <FormSelect label="Salutation" value={salutation} options={["Mr","Mrs","Ms","Dr","Prof"]} onChange={setSalutation} />
            <Input label="First Name"    value={firstName}  onChange={(e) => setFirstName(e.target.value)}  hint="Required" />
            <Input label="Middle Name"   value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
            <Input label="Last Name"     value={lastName}   onChange={(e) => setLastName(e.target.value)}   hint="Required" />
            <FormSelect label="Gender" value={gender} options={["Male","Female","Other","Prefer not to say"]} onChange={setGender} />
            <Input label="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} placeholder="YYYY-MM-DD" />
            <FormSelect label="Customer Type" value={customerType} options={["Individual","Corporate"]} onChange={setCustomerType} />
            <FormSelect label="ID Type" value={idType} options={["NATID","Passport","Alien ID"]} onChange={setIdType} />
            <Input label="ID Number"  value={idNumber}  onChange={(e) => setIdNumber(e.target.value)}  hint="Required" />
            <Input label="KRA Number" value={kraNumber} onChange={(e) => setKraNumber(e.target.value)} />
          </Section>

          {/* Contact Information */}
          <Section icon={<Phone size={15} strokeWidth={2} aria-hidden="true" />} title="Contact Information">
            <Input label="Phone Number"      value={phone}    onChange={(e) => setPhone(e.target.value)}    hint="Required" />
            <Input label="Email"             value={email}    onChange={(e) => setEmail(e.target.value)} />
            <Input label="Alternative Phone" value={altPhone} onChange={(e) => setAltPhone(e.target.value)} />
            <Input label="Alternative Email" value={altEmail} onChange={(e) => setAltEmail(e.target.value)} />
          </Section>

          {/* Location & Address */}
          <Section icon={<MapPin size={15} strokeWidth={2} aria-hidden="true" />} title="Location & Address">
            <Input label="Nationality"          value={nationality}   onChange={(e) => setNationality(e.target.value)} />
            <Input label="Country of Residence" value={countryOfRes}  onChange={(e) => setCountryOfRes(e.target.value)} />
            <Input label="City"                 value={city}          onChange={(e) => setCity(e.target.value)} />
            <Input label="Physical Address"     value={address}       onChange={(e) => setAddress(e.target.value)} />
            <Input label="Postal Address"       value={postalAddress} onChange={(e) => setPostalAddress(e.target.value)} />
            <Input label="Postal Code"          value={postalCode}    onChange={(e) => setPostalCode(e.target.value)} />
          </Section>

          {/* Employment & Financial Details */}
          <Section icon={<Briefcase size={15} strokeWidth={2} aria-hidden="true" />} title="Employment & Financial Details" cols={3}>
            <Input label="Occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
            <FormSelect
              label="Monthly Income / Turnover"
              value={monthlyIncome}
              options={["", "Less than KES 10,000", "KES 10,000–50,000", "KES 51,000–100,000", "KES 101,000–200,000", "KES 201,000–500,000", "KES 501,000–1,000,000"]}
              onChange={setMonthlyIncome}
            />
            <FormSelect
              label="Source of Funds"
              value={sourceOfFunds}
              options={["", "Salary", "Business", "Investment Returns", "Savings", "Inheritance", "Pension"]}
              onChange={setSourceOfFunds}
            />
          </Section>

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
