export interface AccountDraft {
  draftId: string;
  createdAt: string;
  lastSaved: string;
  createdBy: string;
  completionPct: number;
  holderName?: string;
  accountType?: string;
  product?: string;
  cifId?: string;
}

export const accountDrafts: AccountDraft[] = [
  {
    draftId: "ADFT-001", createdAt: "18 Jul 2026", lastSaved: "19 Jul 2026",
    createdBy: "John Mwangi", completionPct: 70,
    holderName: "George Kipchoge Ruto", accountType: "Individual",
    product: "Co-op Bond Fund", cifId: "000712",
  },
  {
    draftId: "ADFT-002", createdAt: "20 Jul 2026", lastSaved: "20 Jul 2026",
    createdBy: "John Mwangi", completionPct: 40,
    holderName: "Aisha Waweru", accountType: "Individual",
    product: "Co-op Money Market Fund",
  },
];

export interface AccountApprovalDiff {
  field: string;
  from: string;
  to: string;
}

export interface AccountApproval {
  id: string;
  type: "new_account" | "edit_account";
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  submittedAt: string;
  accountNo?: string;
  cifId?: string;
  holderName: string;
  product: string;
  accountType?: string;
  reason: string;
  checkerComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  /** For edit_account: what changed */
  diff?: AccountApprovalDiff[];
  /** For new_account: all submitted fields */
  fields?: Record<string, string>;
}

export const accountApprovals: AccountApproval[] = [
  { id: "AAPR-001", type: "new_account", status: "pending",
    submittedBy: "John Mwangi", submittedAt: "19 Jul 2026",
    cifId: "000712", holderName: "Brian Odhiambo", product: "Co-op Bond Fund", accountType: "Individual",
    reason: "New account for onboarded customer. CIF 000712.",
    fields: { "Account Holder": "Brian Odhiambo", "CIF": "000712", "Account Type": "Individual", "Product": "Co-op Bond Fund", "Currency": "KES", "Signing Instructions": "Single signatory.", "Primary Withdrawal": "Bank Transfer — Co-operative Bank, 0123456789" } },
  { id: "AAPR-002", type: "edit_account", status: "approved",
    submittedBy: "John Mwangi", submittedAt: "15 Jul 2026",
    reviewedBy: "Sarah Kamau", reviewedAt: "16 Jul 2026",
    accountNo: "MM00680", cifId: "000634", holderName: "Faith Wanjiru",
    product: "Co-op Money Market Fund", accountType: "Individual",
    reason: "Updated withdrawal bank details.",
    checkerComment: "Verified against signed instruction letter. Approved.",
    diff: [
      { field: "Bank Name",    from: "Equity Bank",  to: "KCB Bank" },
      { field: "Bank Account", from: "0123456789",   to: "9988776655" },
      { field: "Branch",       from: "Westlands",    to: "CBD" },
    ] },
  { id: "AAPR-003", type: "edit_account", status: "pending",
    submittedBy: "Jane Kariuki", submittedAt: "20 Jul 2026",
    accountNo: "BF00003", cifId: "000001", holderName: "Margaret Nungari Muiruri",
    product: "Co-op Bond Fund", accountType: "Individual",
    reason: "Updated signing instructions per board resolution.",
    diff: [
      { field: "Signing Instructions", from: "Single signatory. Account holder only.", to: "Joint signatories — any two of: Account Holder, Spouse." },
    ] },
  { id: "AAPR-004", type: "new_account", status: "rejected",
    submittedBy: "John Mwangi", submittedAt: "10 Jul 2026",
    reviewedBy: "Sarah Kamau", reviewedAt: "11 Jul 2026",
    cifId: "000712", holderName: "George Kipchoge Ruto", product: "Co-op Bond Fund", accountType: "Individual",
    reason: "New account opening for existing customer.",
    checkerComment: "CIF not yet fully verified. KYC documents incomplete. Please resubmit once KYC is approved.",
    fields: { "Account Holder": "George Kipchoge Ruto", "CIF": "000712", "Account Type": "Individual", "Product": "Co-op Bond Fund", "Currency": "KES", "Signing Instructions": "Single signatory.", "Primary Withdrawal": "Mobile Money — M-Pesa, +254720000144" } },
  { id: "AAPR-005", type: "edit_account", status: "rejected",
    submittedBy: "John Mwangi", submittedAt: "08 Jul 2026",
    reviewedBy: "David Ochieng", reviewedAt: "09 Jul 2026",
    accountNo: "CL00385", cifId: "000001", holderName: "Margaret Nungari Muiruri",
    product: "Co-op Money Market Fund", accountType: "Individual",
    reason: "Customer requested change of mobile withdrawal number.",
    checkerComment: "Supporting letter from customer required for mobile number changes. Please resubmit with letter.",
    diff: [
      { field: "Mobile Provider", from: "M-Pesa",       to: "Airtel Money" },
      { field: "Mobile Phone",    from: "+254712000055", to: "+254733000099" },
    ] },
];
