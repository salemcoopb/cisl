export interface CustomerDraft {
  draftId: string;
  createdAt: string;
  lastSaved: string;
  createdBy: string;
  /** How far through the form the user got */
  completionPct: number;
  /** Partial customer fields captured so far */
  firstName?: string;
  middleName?: string;
  lastName?: string;
  idType?: string;
  idNumber?: string;
  phone?: string;
  email?: string;
}

export const drafts: CustomerDraft[] = [
  {
    draftId:       "DFT-001",
    createdAt:     "12 Jul 2026",
    lastSaved:     "14 Jul 2026",
    createdBy:     "John Mwangi",
    completionPct: 65,
    firstName:     "Brian",
    lastName:      "Odhiambo",
    idType:        "NATID",
    idNumber:      "29334412",
    phone:         "+254720000900",
  },
  {
    draftId:       "DFT-002",
    createdAt:     "15 Jul 2026",
    lastSaved:     "15 Jul 2026",
    createdBy:     "John Mwangi",
    completionPct: 30,
    firstName:     "Amina",
    lastName:      "Okonkwo",
    idType:        "Passport",
  },
  {
    draftId:       "DFT-003",
    createdAt:     "18 Jul 2026",
    lastSaved:     "19 Jul 2026",
    createdBy:     "John Mwangi",
    completionPct: 80,
    firstName:     "George",
    middleName:    "Kipchoge",
    lastName:      "Ruto",
    idType:        "NATID",
    idNumber:      "41223344",
    phone:         "+254733000212",
    email:         "george.ruto@gmail.com",
  },
];

export function draftFullName(d: CustomerDraft): string {
  return [d.firstName, d.middleName, d.lastName].filter(Boolean).join(" ") || "Unnamed draft";
}
