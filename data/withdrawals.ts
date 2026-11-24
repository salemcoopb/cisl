export type WithdrawalStage =
  | "needs_action"
  | "pending_checker"
  | "pending_approver"
  | "processing"
  | "disbursed"
  | "failed";

export interface AuditEvent {
  time: string;
  action: string;
  user: string;
  note?: string;
}

export interface Withdrawal {
  withdrawalId: string;
  investmentAccountNo: string;
  accountName: string;
  accountNumber: string;
  availableBalance: number;
  requestedAmount: number;
  currency: string;
  paymentMethod: "bank" | "mobile";
  paymentDetails: string;
  stage: WithdrawalStage;
  returnReason?: string;
  failureReason?: string;
  createdBy: string;
  requestedDate: string;
  requestedTime: string;
  signingInstructions: string;
  approvals?: {
    checker?: { name: string; date: string };
    approver?: { name: string; date: string };
  };
  callbackDetails?: {
    callbackNumber: string;
    verificationNotes: string;
    callbackBy: string;
    callbackDate: string;
  };
  auditTrail: AuditEvent[];
}

export const withdrawals: Withdrawal[] = [
  {
    withdrawalId: "WD-2026-001",
    investmentAccountNo: "BF00201",
    accountName: "Peter Kamau",
    accountNumber: "5566778899",
    availableBalance: 0,
    requestedAmount: 500000,
    currency: "KES",
    paymentMethod: "bank",
    paymentDetails: "Standard Chartered · 5566778899",
    stage: "needs_action",
    returnReason: "Supporting document (signed withdrawal form) missing. Please attach and resubmit.",
    createdBy: "John Mwangi",
    requestedDate: "21 Oct 2026",
    requestedTime: "2026-10-21T10:30:00Z",
    signingInstructions: "Single signatory. Account holder only.",
    auditTrail: [
      { time: "10:30:00", action: "Withdrawal request submitted", user: "John Mwangi" },
      { time: "11:15:00", action: "Returned by checker", user: "Admin", note: "Supporting document missing." },
    ],
  },
  {
    withdrawalId: "WD-2026-002",
    investmentAccountNo: "CL00385",
    accountName: "Margaret Nungari Muiruri",
    accountNumber: "0123456789",
    availableBalance: 450000,
    requestedAmount: 200000,
    currency: "KES",
    paymentMethod: "bank",
    paymentDetails: "Equity Bank · 0123456789",
    stage: "needs_action",
    returnReason: "Account number on withdrawal form does not match the registered account. Please verify and resubmit.",
    createdBy: "Sarah Ngigi",
    requestedDate: "22 Oct 2026",
    requestedTime: "2026-10-22T09:00:00Z",
    signingInstructions: "Single signatory. Account holder only.",
    auditTrail: [
      { time: "09:00:00", action: "Withdrawal request submitted", user: "Sarah Ngigi" },
      { time: "10:00:00", action: "Returned by approver", user: "Admin", note: "Account number mismatch." },
    ],
  },
  {
    withdrawalId: "WD-2026-003",
    investmentAccountNo: "MM00680",
    accountName: "Faith Wanjiru",
    accountNumber: "+254720000121",
    availableBalance: 980000,
    requestedAmount: 50000,
    currency: "KES",
    paymentMethod: "mobile",
    paymentDetails: "M-Pesa · +254720000121",
    stage: "pending_checker",
    createdBy: "John Mwangi",
    requestedDate: "23 Oct 2026",
    requestedTime: "2026-10-23T08:00:00Z",
    signingInstructions: "Single signatory.",
    auditTrail: [
      { time: "08:00:00", action: "Withdrawal request submitted", user: "John Mwangi" },
    ],
  },
  {
    withdrawalId: "WD-2026-004",
    investmentAccountNo: "BF00120",
    accountName: "Andrew Muiyuro",
    accountNumber: "7788990011",
    availableBalance: 0,
    requestedAmount: 1000000,
    currency: "KES",
    paymentMethod: "bank",
    paymentDetails: "Equity Bank · 7788990011",
    stage: "pending_approver",
    approvals: { checker: { name: "James Kariuki", date: "22 Oct 2026, 15:00" } },
    createdBy: "Sarah Ngigi",
    requestedDate: "22 Oct 2026",
    requestedTime: "2026-10-22T14:00:00Z",
    signingInstructions: "Single signatory.",
    auditTrail: [
      { time: "14:00:00", action: "Withdrawal request submitted", user: "Sarah Ngigi" },
      { time: "15:00:00", action: "Cleared by checker", user: "Checker", note: "Reviewed and cleared for approval." },
    ],
  },
  {
    withdrawalId: "WD-2026-005",
    investmentAccountNo: "CL00512",
    accountName: "Agnes Masimane",
    accountNumber: "+254720000001",
    availableBalance: 900000,
    requestedAmount: 300000,
    currency: "KES",
    paymentMethod: "mobile",
    paymentDetails: "M-Pesa · +254720000001",
    stage: "processing",
    approvals: {
      checker:  { name: "James Kariuki", date: "21 Oct 2026, 12:00" },
      approver: { name: "Grace Wambua",  date: "21 Oct 2026, 13:00" },
    },
    createdBy: "John Mwangi",
    requestedDate: "21 Oct 2026",
    requestedTime: "2026-10-21T11:00:00Z",
    signingInstructions: "Single signatory.",
    auditTrail: [
      { time: "11:00:00", action: "Withdrawal request submitted", user: "John Mwangi" },
      { time: "12:00:00", action: "Cleared by checker", user: "Checker" },
      { time: "13:00:00", action: "Approved by approver", user: "Admin", note: "Processing initiated." },
    ],
  },
  {
    withdrawalId: "WD-2026-006",
    investmentAccountNo: "BF00003",
    accountName: "Margaret Nungari Muiruri",
    accountNumber: "9876543210",
    availableBalance: 210000,
    requestedAmount: 150000,
    currency: "KES",
    paymentMethod: "bank",
    paymentDetails: "KCB Bank · 9876543210",
    stage: "disbursed",
    approvals: {
      checker:  { name: "James Kariuki", date: "19 Oct 2026, 10:00" },
      approver: { name: "Grace Wambua",  date: "19 Oct 2026, 11:00" },
    },
    callbackDetails: {
      callbackNumber: "+254712000055",
      verificationNotes: "Client confirmed receipt of KES 150,000. Transaction verified successfully.",
      callbackBy: "Sarah Ngigi",
      callbackDate: "19 Oct 2026, 12:30",
    },
    createdBy: "Sarah Ngigi",
    requestedDate: "19 Oct 2026",
    requestedTime: "2026-10-19T09:00:00Z",
    auditTrail: [
      { time: "09:00:00", action: "Withdrawal request submitted", user: "Sarah Ngigi" },
      { time: "10:00:00", action: "Cleared by checker", user: "Checker" },
      { time: "11:00:00", action: "Approved by approver", user: "Admin" },
      { time: "12:00:00", action: "Disbursed", user: "System", note: "Funds sent to KCB Bank · 9876543210." },
    ],
  },
  {
    withdrawalId: "WD-2026-007",
    investmentAccountNo: "MM00044",
    accountName: "John Ng'ongo",
    accountNumber: "+254720000002",
    availableBalance: 1750000,
    requestedAmount: 100000,
    currency: "KES",
    paymentMethod: "mobile",
    paymentDetails: "M-Pesa · +254720000002",
    stage: "disbursed",
    callbackDetails: {
      callbackNumber: "+254720000002",
      verificationNotes: "Client confirmed receipt. No issues reported.",
      callbackBy: "John Mwangi",
      callbackDate: "18 Oct 2026, 11:45",
    },
    createdBy: "John Mwangi",
    requestedDate: "18 Oct 2026",
    requestedTime: "2026-10-18T10:00:00Z",
    signingInstructions: "Single signatory.",
    auditTrail: [
      { time: "10:00:00", action: "Withdrawal request submitted", user: "John Mwangi" },
      { time: "10:30:00", action: "Cleared by checker", user: "Checker" },
      { time: "11:00:00", action: "Approved by approver", user: "Admin" },
      { time: "11:30:00", action: "Disbursed", user: "System" },
    ],
  },
  {
    withdrawalId: "WD-2026-008",
    investmentAccountNo: "FD00921",
    accountName: "John Ng'ongo",
    accountNumber: "4455667788",
    availableBalance: 0,
    requestedAmount: 250000,
    currency: "KES",
    paymentMethod: "bank",
    paymentDetails: "Co-operative Bank · 4455667788",
    stage: "failed",
    failureReason: "Core banking API timeout during disbursement. Funds not transferred. Please retry.",
    createdBy: "Sarah Ngigi",
    requestedDate: "20 Oct 2026",
    requestedTime: "2026-10-20T14:00:00Z",
    signingInstructions: "Single signatory.",
    auditTrail: [
      { time: "14:00:00", action: "Withdrawal request submitted", user: "Sarah Ngigi" },
      { time: "14:30:00", action: "Cleared by checker", user: "Checker" },
      { time: "15:00:00", action: "Approved by approver", user: "Admin" },
      { time: "15:05:00", action: "Disbursement failed", user: "System", note: "API timeout. Transaction rolled back." },
    ],
  },
];

export function getWithdrawal(id: string): Withdrawal | undefined {
  return withdrawals.find(w => w.withdrawalId === id);
}
