export type DepositStatus = "successful" | "unsuccessful";
export type ProcessingStage =
  | "pending"
  | "waiting_review"
  | "investment_in_progress"
  | "processing"
  | "invested"
  | "archived"
  | "rejected";

export interface AuditEvent {
  time: string;
  action: string;
  user: string;
  note?: string;
}

export interface Deposit {
  depositId: string;
  receivedTime: string;        // ISO string
  clientAccount: string | null; // null for unsuccessful
  accountName: string | null;
  amount: number;
  currency: string;
  fund: string | null;          // null for unsuccessful
  status: DepositStatus;
  stage: ProcessingStage;
  // Detail modal fields
  narration: string;
  postingDate: string;
  valueDate: string;
  collectionAccount: string;
  investmentAccount: string | null;
  investmentTime: string | null;
  channel: string;
  agingDays: number;
  rejectionReason?: string;
  rejectionType?: "reverse" | "reject";
  submissionType?: "invest" | "reallocate" | "reject_deposit";
  submissionNote?: string;
  auditTrail: AuditEvent[];
}

export const deposits: Deposit[] = [
  {
    depositId: "DEP-2026-001",
    receivedTime: "2026-10-23T08:14:33Z",
    clientAccount: "BF00201",
    accountName: "Peter Kamau",
    amount: 500000,
    currency: "KES",
    fund: "Co-op Bond Fund",
    status: "successful",
    stage: "pending",
    narration: "RTGS/BF00201/Peter Kamau/Investment deposit October",
    postingDate: "23 Oct 2026",
    valueDate: "23 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: null,
    investmentTime: null,
    channel: "RTGS",
    agingDays: 0,
    auditTrail: [
      { time: "08:14:33", action: "Deposit received", user: "System", note: "Credited to collection account COLL-001-KES" },
      { time: "08:14:35", action: "Auto-matched", user: "System", note: "Account BF00201 identified from narration" },
    ],
  },
  {
    depositId: "DEP-2026-002",
    receivedTime: "2026-10-23T08:45:12Z",
    clientAccount: "CL00385",
    accountName: "Margaret Nungari Muiruri",
    amount: 1200000,
    currency: "KES",
    fund: "Co-op Money Market Fund",
    status: "successful",
    stage: "pending",
    narration: "EFT/CL00385/MUIRURI MARGARET/TOP UP MMF",
    postingDate: "23 Oct 2026",
    valueDate: "23 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: null,
    investmentTime: null,
    channel: "EFT",
    agingDays: 0,
    auditTrail: [
      { time: "08:45:12", action: "Deposit received", user: "System", note: "Credited to collection account COLL-001-KES" },
      { time: "08:45:14", action: "Auto-matched", user: "System", note: "Account CL00385 identified from narration" },
    ],
  },
  {
    depositId: "DEP-2026-003",
    receivedTime: "2026-10-23T09:02:07Z",
    clientAccount: "MM00680",
    accountName: "Faith Wanjiru",
    amount: 250000,
    currency: "KES",
    fund: "Co-op Money Market Fund",
    status: "successful",
    stage: "pending",
    narration: "MPESA/0720000121/FAITH WANJIRU/MM00680 DEPOSIT",
    postingDate: "23 Oct 2026",
    valueDate: "23 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: null,
    investmentTime: null,
    channel: "M-Pesa",
    agingDays: 0,
    auditTrail: [
      { time: "09:02:07", action: "Deposit received", user: "System", note: "Credited to collection account COLL-001-KES" },
      { time: "09:02:09", action: "Auto-matched", user: "System", note: "Account MM00680 identified from narration" },
    ],
  },
  {
    depositId: "DEP-2026-004",
    receivedTime: "2026-10-23T09:30:44Z",
    clientAccount: null,
    accountName: null,
    amount: 300000,
    currency: "KES",
    fund: null,
    status: "unsuccessful",
    stage: "pending",
    narration: "EFT/0712345678/JOHN DOE/SAVINGS",
    postingDate: "23 Oct 2026",
    valueDate: "23 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: null,
    investmentTime: null,
    channel: "EFT",
    agingDays: 0,
    auditTrail: [
      { time: "09:30:44", action: "Deposit received", user: "System", note: "Credited to collection account COLL-001-KES" },
      { time: "09:30:46", action: "Match failed", user: "System", note: "No account number found in narration. Manual review required." },
    ],
  },
  {
    depositId: "DEP-2026-005",
    receivedTime: "2026-10-23T10:11:22Z",
    clientAccount: null,
    accountName: null,
    amount: 75000,
    currency: "KES",
    fund: null,
    status: "unsuccessful",
    stage: "pending",
    narration: "RTGS/PAYMENTS/ACME HOLDINGS LTD/REF 887234",
    postingDate: "23 Oct 2026",
    valueDate: "23 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: null,
    investmentTime: null,
    channel: "RTGS",
    agingDays: 1,
    auditTrail: [
      { time: "10:11:22", action: "Deposit received", user: "System", note: "Credited to collection account COLL-001-KES" },
      { time: "10:11:24", action: "Match failed", user: "System", note: "Sender 'ACME HOLDINGS LTD' not matched to any client account." },
    ],
  },
  {
    depositId: "DEP-2026-006",
    receivedTime: "2026-10-23T11:05:58Z",
    clientAccount: "BF00120",
    accountName: "Andrew Muiyuro",
    amount: 800000,
    currency: "KES",
    fund: "Co-op Bond Fund",
    status: "successful",
    stage: "pending",
    narration: "EFT/BF00120/ANDREW MUIYURO/BOND FUND TOP UP",
    postingDate: "23 Oct 2026",
    valueDate: "23 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: null,
    investmentTime: null,
    channel: "EFT",
    agingDays: 0,
    auditTrail: [
      { time: "11:05:58", action: "Deposit received", user: "System", note: "Credited to collection account COLL-001-KES" },
      { time: "11:06:00", action: "Auto-matched", user: "System", note: "Account BF00120 identified from narration" },
    ],
  },
  {
    depositId: "DEP-2026-007",
    receivedTime: "2026-10-23T11:44:19Z",
    clientAccount: null,
    accountName: null,
    amount: 150000,
    currency: "KES",
    fund: null,
    status: "unsuccessful",
    stage: "pending",
    narration: "MPESA/0733000222/MARY NJOKI/",
    postingDate: "23 Oct 2026",
    valueDate: "23 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: null,
    investmentTime: null,
    channel: "M-Pesa",
    agingDays: 0,
    auditTrail: [
      { time: "11:44:19", action: "Deposit received", user: "System", note: "Credited to collection account COLL-001-KES" },
      { time: "11:44:20", action: "Match failed", user: "System", note: "Empty narration reference. Manual review required." },
    ],
  },
];

export function getDeposit(id: string): Deposit | undefined {
  return deposits.find((d) => d.depositId === id);
}

// Invested seed data
deposits.push(
  {
    depositId: "DEP-2026-013",
    receivedTime: "2026-10-20T09:10:00Z",
    clientAccount: "CL00385",
    accountName: "Margaret Nungari Muiruri",
    amount: 500000,
    currency: "KES",
    fund: "Co-op Money Market Fund",
    status: "successful",
    stage: "invested",
    narration: "EFT/CL00385/MARGARET MUIRURI/MMF DEPOSIT",
    postingDate: "20 Oct 2026",
    valueDate: "20 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: "CL00385",
    investmentTime: "2026-10-20T10:45:00Z",
    channel: "EFT",
    agingDays: 0,
    auditTrail: [
      { time: "09:10:00", action: "Deposit received", user: "System" },
      { time: "09:10:02", action: "Auto-matched", user: "System" },
      { time: "09:40:00", action: "Submitted for investment", user: "John Mwangi" },
      { time: "10:05:00", action: "Approved by checker", user: "Admin" },
      { time: "10:45:00", action: "Investment complete", user: "System", note: "Funds moved to investment account CL00385." },
    ],
  },
  {
    depositId: "DEP-2026-014",
    receivedTime: "2026-10-19T11:30:00Z",
    clientAccount: "BF00120",
    accountName: "Andrew Muiyuro",
    amount: 3000000,
    currency: "KES",
    fund: "Co-op Bond Fund",
    status: "successful",
    stage: "invested",
    narration: "RTGS/BF00120/ANDREW MUIYURO/BOND FUND",
    postingDate: "19 Oct 2026",
    valueDate: "19 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: "BF00120",
    investmentTime: "2026-10-19T13:00:00Z",
    channel: "RTGS",
    agingDays: 0,
    auditTrail: [
      { time: "11:30:00", action: "Deposit received", user: "System" },
      { time: "11:30:02", action: "Auto-matched", user: "System" },
      { time: "12:00:00", action: "Submitted for investment", user: "Sarah Ngigi" },
      { time: "12:30:00", action: "Approved by checker", user: "Admin" },
      { time: "13:00:00", action: "Investment complete", user: "System", note: "Funds moved to investment account BF00120." },
    ],
  },
  {
    depositId: "DEP-2026-015",
    receivedTime: "2026-10-18T14:05:00Z",
    clientAccount: "FD01002",
    accountName: "Andrew Muiyuro",
    amount: 1200000,
    currency: "KES",
    fund: "Co-op Fixed Income Gratuity Fund",
    status: "successful",
    stage: "invested",
    narration: "EFT/FD01002/MUIYURO/GRATUITY FUND",
    postingDate: "18 Oct 2026",
    valueDate: "18 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: "FD01002",
    investmentTime: "2026-10-18T15:30:00Z",
    channel: "EFT",
    agingDays: 0,
    auditTrail: [
      { time: "14:05:00", action: "Deposit received", user: "System" },
      { time: "14:05:02", action: "Auto-matched", user: "System" },
      { time: "14:30:00", action: "Submitted for investment", user: "John Mwangi" },
      { time: "15:00:00", action: "Approved by checker", user: "Admin" },
      { time: "15:30:00", action: "Investment complete", user: "System" },
    ],
  }
);
deposits.push(
  {
    depositId: "DEP-2026-011",
    receivedTime: "2026-10-21T10:15:00Z",
    clientAccount: "BF00201",
    accountName: "Peter Kamau",
    amount: 1500000,
    currency: "KES",
    fund: "Co-op Bond Fund",
    status: "successful",
    stage: "investment_in_progress",
    narration: "RTGS/BF00201/PETER KAMAU/BOND INVESTMENT",
    postingDate: "21 Oct 2026",
    valueDate: "21 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: "BF00201",
    investmentTime: "2026-10-21T11:30:00Z",
    channel: "RTGS",
    agingDays: 2,
    auditTrail: [
      { time: "10:15:00", action: "Deposit received", user: "System" },
      { time: "10:15:02", action: "Auto-matched", user: "System", note: "Account BF00201 identified" },
      { time: "10:45:00", action: "Submitted for investment", user: "John Mwangi" },
      { time: "11:30:00", action: "Approved by checker", user: "Admin", note: "Investment approved. Processing initiated." },
    ],
  },
  {
    depositId: "DEP-2026-012",
    receivedTime: "2026-10-21T08:30:00Z",
    clientAccount: "MM00044",
    accountName: "John Ng'ongo",
    amount: 300000,
    currency: "KES",
    fund: "Co-op Money Market Fund",
    status: "successful",
    stage: "investment_in_progress",
    narration: "MPESA/0720000002/JOHN NGONGO/MMF TOP UP",
    postingDate: "21 Oct 2026",
    valueDate: "21 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: "MM00044",
    investmentTime: "2026-10-21T09:05:00Z",
    channel: "M-Pesa",
    agingDays: 2,
    auditTrail: [
      { time: "08:30:00", action: "Deposit received", user: "System" },
      { time: "08:30:02", action: "Auto-matched", user: "System", note: "Account MM00044 identified" },
      { time: "08:55:00", action: "Submitted for investment", user: "Sarah Ngigi" },
      { time: "09:05:00", action: "Approved by checker", user: "Admin" },
    ],
  }
);
deposits.push(
  {
    depositId: "DEP-2026-008",
    receivedTime: "2026-10-22T14:20:00Z",
    clientAccount: "FD00921",
    accountName: "John Ng'ongo",
    amount: 750000,
    currency: "KES",
    fund: "Co-op Fixed Income Gratuity Fund",
    status: "successful",
    stage: "waiting_review",
    narration: "EFT/FD00921/JOHN NGONGO/GRATUITY TOP UP",
    postingDate: "22 Oct 2026",
    valueDate: "22 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: null,
    investmentTime: null,
    channel: "EFT",
    agingDays: 1,
    auditTrail: [
      { time: "14:20:00", action: "Deposit received", user: "System", note: "Credited to collection account" },
      { time: "14:20:02", action: "Auto-matched", user: "System", note: "Account FD00921 identified" },
      { time: "15:03:44", action: "Submitted for investment", user: "John Mwangi", note: "Moved to Waiting Review for checker approval" },
    ],
    submissionType: "invest",
    submissionNote: "Investment submission — funds to be moved to account FD00921.",
  },
  {
    depositId: "DEP-2026-009",
    receivedTime: "2026-10-22T09:55:10Z",
    clientAccount: "BF00003",
    accountName: "Margaret Nungari Muiruri",
    amount: 2000000,
    currency: "KES",
    fund: "Co-op Bond Fund",
    status: "successful",
    stage: "waiting_review",
    narration: "RTGS/BF00003/MUIRURI MARGARET/BOND FUND",
    postingDate: "22 Oct 2026",
    valueDate: "22 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: null,
    investmentTime: null,
    channel: "RTGS",
    agingDays: 1,
    auditTrail: [
      { time: "09:55:10", action: "Deposit received", user: "System" },
      { time: "09:55:12", action: "Auto-matched", user: "System", note: "Account BF00003 identified" },
      { time: "10:30:00", action: "Submitted for investment", user: "John Mwangi" },
    ],
    submissionType: "reallocate",
    submissionNote: "Reallocation from unmatched deposit — target account BF00003.",
  },
  {
    depositId: "DEP-2026-010",
    receivedTime: "2026-10-21T16:40:33Z",
    clientAccount: "CL00512",
    accountName: "Agnes Masimane",
    amount: 450000,
    currency: "KES",
    fund: "Co-op Money Market Fund",
    status: "successful",
    stage: "waiting_review",
    narration: "MPESA/0720000001/AGNES MASIMANE/MMF DEPOSIT",
    postingDate: "21 Oct 2026",
    valueDate: "21 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: null,
    investmentTime: null,
    channel: "M-Pesa",
    agingDays: 2,
    auditTrail: [
      { time: "16:40:33", action: "Deposit received", user: "System" },
      { time: "16:40:35", action: "Auto-matched", user: "System", note: "Account CL00512 identified" },
      { time: "17:10:00", action: "Submitted for investment", user: "Sarah Ngigi" },
    ],
    submissionType: "reject_deposit",
    submissionNote: "Marked as rejected — no client account found in narration.",
  }
);

// Rejected seed data
deposits.push(
  {
    depositId: "DEP-2026-016",
    receivedTime: "2026-10-20T07:45:00Z",
    clientAccount: null,
    accountName: null,
    amount: 200000,
    currency: "KES",
    fund: null,
    status: "unsuccessful",
    stage: "rejected",
    narration: "EFT/UNKNOWN/JANE DOE/PAYMENT",
    postingDate: "20 Oct 2026",
    valueDate: "20 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: null,
    investmentTime: null,
    channel: "EFT",
    agingDays: 3,
    rejectionType: "reject",
    rejectionReason: "Narration does not contain a valid client account number. Deposit flagged as invalid after 3 days without matching.",
    auditTrail: [
      { time: "07:45:00", action: "Deposit received", user: "System" },
      { time: "07:45:02", action: "Match failed", user: "System", note: "No account number in narration." },
      { time: "10:20:00", action: "Marked as rejected", user: "John Mwangi", note: "Deposit flagged as invalid. No financial changes applied." },
    ],
  },
  {
    depositId: "DEP-2026-017",
    receivedTime: "2026-10-19T13:20:00Z",
    clientAccount: "MM00680",
    accountName: "Faith Wanjiru",
    amount: 50000,
    currency: "KES",
    fund: "Co-op Money Market Fund",
    status: "successful",
    stage: "rejected",
    narration: "MPESA/0720000121/FAITH WANJIRU/MM00680",
    postingDate: "19 Oct 2026",
    valueDate: "19 Oct 2026",
    collectionAccount: "COLL-001-KES",
    investmentAccount: null,
    investmentTime: null,
    channel: "M-Pesa",
    agingDays: 0,
    rejectionType: "reverse",
    rejectionReason: "Duplicate deposit — reversal already processed at Finacle level. Balance deducted accordingly.",
    auditTrail: [
      { time: "13:20:00", action: "Deposit received", user: "System" },
      { time: "13:20:02", action: "Auto-matched", user: "System", note: "Account MM00680 identified." },
      { time: "14:05:00", action: "Reversed & rejected", user: "Sarah Ngigi", note: "Duplicate transaction confirmed. Finacle reversal applied." },
    ],
  }
);
