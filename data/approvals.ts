export type ApprovalType = "new_customer" | "edit_customer";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalDiff {
  field: string;
  from: string;
  to: string;
}

export interface Approval {
  id: string;
  type: ApprovalType;
  status: ApprovalStatus;
  submittedBy: string;
  submittedAt: string;
  customerName: string;
  cifId?: string;
  reason: string;
  checkerComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  diff: ApprovalDiff[];
}

export const approvals: Approval[] = [
  {
    id: "APR-001", type: "edit_customer", status: "pending",
    submittedBy: "John Mwangi", submittedAt: "19 Jul 2026",
    customerName: "Margaret Nungari Muiruri", cifId: "000001",
    reason: "Customer called to update phone number and physical address.",
    diff: [
      { field: "Phone Number",     from: "+254712000055", to: "+254712000099" },
      { field: "Physical Address", from: "Gilgil",        to: "Westlands, Nairobi" },
    ],
  },
  {
    id: "APR-002", type: "new_customer", status: "pending",
    submittedBy: "Jane Kariuki", submittedAt: "19 Jul 2026",
    customerName: "Brian Odhiambo",
    reason: "New walk-in customer onboarding. All documents verified.",
    diff: [
      { field: "First Name", from: "—", to: "Brian" },
      { field: "Last Name",  from: "—", to: "Odhiambo" },
      { field: "ID Type",    from: "—", to: "NATID" },
      { field: "ID Number",  from: "—", to: "29334412" },
      { field: "Phone",      from: "—", to: "+254720000900" },
    ],
  },
  {
    id: "APR-003", type: "edit_customer", status: "pending",
    submittedBy: "John Mwangi", submittedAt: "20 Jul 2026",
    customerName: "Peter Kamau", cifId: "000517",
    reason: "Updated KRA number after customer provided corrected certificate.",
    diff: [{ field: "KRA Number", from: "A007889900L", to: "A007889900M" }],
  },
  {
    id: "APR-004", type: "edit_customer", status: "approved",
    submittedBy: "John Mwangi", submittedAt: "15 Jul 2026",
    reviewedBy: "Sarah Kamau", reviewedAt: "16 Jul 2026",
    customerName: "Susan Thuku", cifId: "000311",
    reason: "Customer provided updated email address.",
    checkerComment: "Verified against supporting email. Approved.",
    diff: [{ field: "Email", from: "susan.thuku@gmail.com", to: "s.thuku.new@gmail.com" }],
  },
  {
    id: "APR-005", type: "new_customer", status: "rejected",
    submittedBy: "John Mwangi", submittedAt: "12 Jul 2026",
    reviewedBy: "Sarah Kamau", reviewedAt: "13 Jul 2026",
    customerName: "Aisha Waweru",
    reason: "New customer walk-in.",
    checkerComment: "ID document appears expired. Please re-verify and resubmit.",
    diff: [
      { field: "First Name", from: "—", to: "Aisha" },
      { field: "Last Name",  from: "—", to: "Waweru" },
      { field: "ID Number",  from: "—", to: "33445566" },
    ],
  },
];
