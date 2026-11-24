export type LienReason = "Court Case" | "Suspicious Transactions" | "Tax Dues" | "Regulatory Compliance" | "Other";
export type LienStatus = "active" | "released" | "pending_release";
export type LienAction = "Add Lien" | "Release Lien";

export interface LienDocument {
  label: string;
  fileName?: string;
  status: "uploaded" | "missing";
}

export interface Lien {
  lienId: string;
  accountNo: string;
  accountName: string;
  accountHolder: string;
  cifId?: string;
  amount: number;
  currency: string;
  bankName?: string;
  branchName?: string;
  action: LienAction;
  reason: LienReason;
  reasonDetails?: string;
  requestDate: string;
  processedDate?: string;
  status: LienStatus;
  placedBy: string;
  initiatorName: string;
  initiatorRemarks: string;
  releasedBy?: string;
  releasedDate?: string;
  releaseReason?: string;
  documents: LienDocument[];
}

export const liens: Lien[] = [
  {
    lienId: "LIEN-001", accountNo: "BF00201", accountName: "BF00201 — Co-op Bond Fund",
    accountHolder: "Peter Kamau", cifId: "000517",
    amount: 2000000, currency: "KES", bankName: "Standard Chartered", branchName: "Kisumu",
    action: "Add Lien", reason: "Court Case",
    reasonDetails: "High Court petition No. 142/2025. Freeze pending probate resolution.",
    requestDate: "25 Nov 2025", processedDate: "25 Nov 2025", status: "active",
    placedBy: "J. Kariuki", initiatorName: "James Kariuki", initiatorRemarks: "Court order received and verified. Lien placed as instructed.",
    documents: [
      { label: "Court Order", fileName: "court_order_142_2025.pdf", status: "uploaded" },
      { label: "Supporting Letter", status: "missing" },
    ],
  },
  {
    lienId: "LIEN-002", accountNo: "CISL-CORP-0042189", accountName: "CISL-CORP-0042189 — Fixed Income",
    accountHolder: "Acme Holdings Ltd",
    amount: 5000000, currency: "KES", bankName: "Co-operative Bank", branchName: "Upper Hill",
    action: "Add Lien", reason: "Regulatory Compliance",
    reasonDetails: "AML review in progress per CBK directive. Account frozen pending investigation.",
    requestDate: "15 Dec 2025", processedDate: "15 Dec 2025", status: "active",
    placedBy: "M. Wairimu", initiatorName: "Mary Wairimu", initiatorRemarks: "Regulatory directive received from CBK compliance unit. Account restricted as required.",
    documents: [
      { label: "Regulatory Notice", fileName: "cbk_directive_dec2025.pdf", status: "uploaded" },
      { label: "Internal Approval", fileName: "internal_approval.pdf", status: "uploaded" },
    ],
  },
  {
    lienId: "LIEN-003", accountNo: "BF00003", accountName: "BF00003 — Co-op Bond Fund",
    accountHolder: "Margaret Nungari Muiruri", cifId: "000001",
    amount: 1000000, currency: "KES", bankName: "KCB Bank", branchName: "CBD",
    action: "Add Lien", reason: "Other",
    reasonDetails: "Customer instruction — estate planning hold requested in writing.",
    requestDate: "18 Dec 2025", processedDate: "18 Dec 2025", status: "active",
    placedBy: "S. Ngigi", initiatorName: "Samuel Ngigi", initiatorRemarks: "Customer wrote in requesting a hold for estate planning purposes. Verified identity and signature.",
    documents: [
      { label: "Customer Instruction Letter", fileName: "customer_instruction_dec2025.pdf", status: "uploaded" },
    ],
  },
  {
    lienId: "LIEN-004", accountNo: "FD01188", accountName: "FD01188 — Fixed Income",
    accountHolder: "Peter Kamau", cifId: "000517",
    amount: 500000, currency: "KES", bankName: "Standard Chartered", branchName: "Kisumu",
    action: "Release Lien", reason: "Court Case",
    reasonDetails: "Lien expired — court order lifted following settlement.",
    requestDate: "20 Jan 2026", processedDate: "20 Jan 2026", status: "released",
    placedBy: "A. Odhiambo", initiatorName: "Alice Odhiambo", initiatorRemarks: "Court cleared the hold. Release processed as per court clearance certificate.",
    releasedBy: "Sarah Kamau", releasedDate: "20 Jan 2026",
    releaseReason: "Court order lifted. Customer provided clearance certificate.",
    documents: [
      { label: "Court Clearance Certificate", fileName: "court_clearance_jan2026.pdf", status: "uploaded" },
      { label: "Release Instruction", fileName: "release_instruction.pdf", status: "uploaded" },
    ],
  },
  {
    lienId: "LIEN-005", accountNo: "BF00071", accountName: "BF00071 — Co-op Bond Fund",
    accountHolder: "John Ng'ongo", cifId: "000203",
    amount: 750000, currency: "KES", bankName: "Co-operative Bank", branchName: "Mombasa",
    action: "Release Lien", reason: "Tax Dues",
    reasonDetails: "KRA tax lien placed pending settlement of outstanding tax arrears.",
    requestDate: "05 Oct 2025", processedDate: "06 Oct 2025", status: "released",
    placedBy: "S. Ngigi", initiatorName: "Samuel Ngigi", initiatorRemarks: "KRA directive received. Lien placed on account per instruction.",
    releasedBy: "David Ochieng", releasedDate: "15 Feb 2026",
    releaseReason: "KRA confirmed full settlement of tax arrears. Tax clearance certificate provided.",
    documents: [
      { label: "KRA Tax Clearance", fileName: "kra_clearance_feb2026.pdf", status: "uploaded" },
      { label: "Settlement Confirmation", fileName: "settlement_confirmation.pdf", status: "uploaded" },
    ],
  },
  {
    lienId: "LIEN-006", accountNo: "MM00044", accountName: "MM00044 — Money Market Fund",
    accountHolder: "John Ng'ongo", cifId: "000203",
    amount: 300000, currency: "KES", bankName: "Co-operative Bank", branchName: "Mombasa",
    action: "Release Lien", reason: "Suspicious Transactions",
    reasonDetails: "Account frozen pending AML investigation into unusual transaction patterns.",
    requestDate: "12 Nov 2025", processedDate: "12 Nov 2025", status: "released",
    placedBy: "M. Wairimu", initiatorName: "Mary Wairimu", initiatorRemarks: "AML team flagged unusual deposits. Account frozen pending review.",
    releasedBy: "Sarah Kamau", releasedDate: "10 Jan 2026",
    releaseReason: "AML investigation completed. No suspicious activity confirmed. Account cleared.",
    documents: [
      { label: "AML Clearance Report", fileName: "aml_clearance_jan2026.pdf", status: "uploaded" },
    ],
  },
];

export interface PendingLien {
  id: string;
  type: "add" | "release";
  status: "pending" | "declined";
  accountNo: string;
  accountHolder: string;
  cifId?: string;
  amount: number;
  reason: string;
  releaseRemarks?: string;   // for type === "release"
  submittedBy: string;
  submittedAt: string;
  checkerComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export const pendingLiens: PendingLien[] = [
  {
    id: "PLIEN-001", type: "add", status: "pending",
    accountNo: "MM00512", accountHolder: "Peter Kamau", cifId: "000517",
    amount: 800000, reason: "Inheritance dispute — temporary hold requested by next of kin.",
    submittedBy: "John Mwangi", submittedAt: "21 Jul 2026",
  },
  {
    id: "PLIEN-002", type: "release", status: "pending",
    accountNo: "BF00003", accountHolder: "Margaret Nungari Muiruri", cifId: "000001",
    amount: 1000000,
    reason: "Estate settled. Requesting release of hold placed on 18 Dec 2025.",
    releaseRemarks: "Probate granted by High Court on 15 Jul 2026. Certificate of confirmation attached. Customer has formally requested release of funds.",
    submittedBy: "John Mwangi", submittedAt: "22 Jul 2026",
  },
  {
    id: "PLIEN-003", type: "add", status: "declined",
    accountNo: "CL00733", accountHolder: "Susan Thuku", cifId: "000311",
    amount: 200000, reason: "Customer complaint — requesting freeze pending investigation.",
    submittedBy: "John Mwangi", submittedAt: "10 Jul 2026",
    checkerComment: "Insufficient documentation to support the lien request. Please attach supporting court order or formal complaint letter.",
    reviewedBy: "Sarah Kamau", reviewedAt: "11 Jul 2026",
  },
];
