export type KycStatus = "verified" | "pending";
export type DocStatus = "verified" | "uploaded" | "missing";

export interface InvestmentAccountRef {
  accountNo: string;
  name: string;
  product: string;
  value: number;
}

export interface Beneficiary {
  salutation: string;
  firstName: string;
  lastName: string;
  relationship: string;
  mobile: string;
  email: string;
}

export interface CustomerDoc {
  label: string;
  status: DocStatus;
  fileName?: string;
  date?: string;
}

export interface PepAnswers {
  politicalAffiliation: boolean;
  publicOffice: boolean;
  currentPosition: boolean;
  details?: string;
}

export interface Customer {
  cifId: string;
  salutation: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  dob: string;
  customerType: "Individual" | "Corporate";
  idType: string;
  idNumber: string;
  idMasked: string;
  kraNumber: string;
  phone: string;
  phoneMasked: string;
  altPhone?: string;
  email: string;
  emailMasked: string;
  altEmail?: string;
  nationality: string;
  countryOfResidence: string;
  city: string;
  physicalAddress: string;
  postalAddress?: string;
  postalCode?: string;
  occupation: string;
  monthlyIncome?: string;
  sourceOfFunds?: string;
  dateOnboarded: string;
  kyc: KycStatus;
  pep: boolean;
  accounts: InvestmentAccountRef[];
  beneficiaries: Beneficiary[];
  pepAnswers: PepAnswers;
  taxExempt: boolean;
  taxNote?: string;
  documents: CustomerDoc[];
}

const DOC_LABELS = [
  "ID Front Image",
  "ID Back Image",
  "Verified ID Copy",
  "Signature Image",
  "Work Permit",
  "KRA Copy",
  "Passport Copy",
  "Face Verification Photo",
];

function docs(over: Record<string, { status: DocStatus; fileName?: string; date?: string }>): CustomerDoc[] {
  return DOC_LABELS.map((label) => ({ label, ...(over[label] ?? { status: "missing" as DocStatus }) }));
}

export const customers: Customer[] = [
  {
    cifId: "000001",
    salutation: "Ms",
    firstName: "Margaret",
    middleName: "Nungari",
    lastName: "Muiruri",
    gender: "Female",
    dob: "1958-12-31",
    customerType: "Individual",
    idType: "NATID",
    idNumber: "34697886",
    idMasked: "34****86",
    kraNumber: "A001423266Z",
    phone: "+254712000055",
    phoneMasked: "+254 7•• ••• 055",
    altPhone: "+254 7•• ••• 449",
    email: "mamanungari92_test@gmail.com",
    emailMasked: "m*****@gmail.com",
    nationality: "Kenyan",
    countryOfResidence: "Kenya",
    city: "Ruaraka",
    physicalAddress: "Gilgil",
    postalAddress: "P.O. Box 1234",
    postalCode: "00200",
    occupation: "Entrepreneur",
    monthlyIncome: "201K–500K",
    sourceOfFunds: "Business",
    dateOnboarded: "18 May 2022",
    kyc: "verified",
    pep: false,
    accounts: [
      { accountNo: "CL00385", name: "Margaret Nungari Muiruri", product: "Call Deposit", value: 2450000 },
      { accountNo: "BF00003", name: "Margaret Nungari Muiruri", product: "Bond Fund", value: 6180000 },
    ],
    beneficiaries: [
      { salutation: "Mr", firstName: "David", lastName: "Muiruri", relationship: "Son", mobile: "+254 7•• ••• 210", email: "d*****@gmail.com" },
      { salutation: "Ms", firstName: "Grace", lastName: "Muiruri", relationship: "Daughter", mobile: "+254 7•• ••• 337", email: "g*****@gmail.com" },
    ],
    pepAnswers: { politicalAffiliation: false, publicOffice: false, currentPosition: false },
    taxExempt: false,
    documents: docs({
      "ID Front Image": { status: "verified", fileName: "id_front.jpg", date: "18 May 2022" },
      "ID Back Image": { status: "verified", fileName: "id_back.jpg", date: "18 May 2022" },
      "Verified ID Copy": { status: "verified", fileName: "verified_id.pdf", date: "19 May 2022" },
      "Signature Image": { status: "uploaded", fileName: "signature.png", date: "18 May 2022" },
      "KRA Copy": { status: "verified", fileName: "kra_a001423266z.pdf", date: "19 May 2022" },
      "Face Verification Photo": { status: "uploaded", fileName: "face_verify.jpg", date: "18 May 2022" },
    }),
  },
  {
    cifId: "000148",
    salutation: "Ms",
    firstName: "Agnes",
    lastName: "Masimane",
    gender: "Female",
    dob: "1971-04-12",
    customerType: "Individual",
    idType: "NATID",
    idNumber: "57882197",
    idMasked: "57****97",
    kraNumber: "A004881120K",
    phone: "+254720000001",
    phoneMasked: "+254 7•• ••• 001",
    email: "agnes.masimane@gmail.com",
    emailMasked: "a*****@gmail.com",
    nationality: "Kenyan",
    countryOfResidence: "Kenya",
    city: "Nairobi",
    physicalAddress: "Kilimani",
    occupation: "County Executive",
    dateOnboarded: "26 May 2022",
    kyc: "verified",
    pep: true,
    accounts: [{ accountNo: "CL00512", name: "Agnes Masimane", product: "Call Deposit", value: 8900000 }],
    beneficiaries: [],
    pepAnswers: {
      politicalAffiliation: true,
      publicOffice: true,
      currentPosition: true,
      details: "County Executive Committee Member, Nairobi County (since 2021). Flagged for enhanced due diligence.",
    },
    taxExempt: false,
    documents: docs({
      "ID Front Image": { status: "verified", fileName: "id_front.jpg", date: "26 May 2022" },
      "ID Back Image": { status: "verified", fileName: "id_back.jpg", date: "26 May 2022" },
      "Verified ID Copy": { status: "uploaded", fileName: "verified_id.pdf", date: "26 May 2022" },
      "KRA Copy": { status: "verified", fileName: "kra.pdf", date: "27 May 2022" },
    }),
  },
  {
    cifId: "000203",
    salutation: "Mr",
    firstName: "John",
    lastName: "Ng'ongo",
    gender: "Male",
    dob: "1985-09-03",
    customerType: "Individual",
    idType: "NATID",
    idNumber: "11220035",
    idMasked: "11****35",
    kraNumber: "A006723344P",
    phone: "+254720000002",
    phoneMasked: "+254 7•• ••• 002",
    email: "john.ngongo@gmail.com",
    emailMasked: "j*****@gmail.com",
    nationality: "Kenyan",
    countryOfResidence: "Kenya",
    city: "Mombasa",
    physicalAddress: "Nyali",
    postalAddress: "P.O. Box 8842",
    postalCode: "80100",
    occupation: "Logistics Manager",
    monthlyIncome: "101K–200K",
    sourceOfFunds: "Salary",
    dateOnboarded: "26 May 2022",
    kyc: "verified",
    pep: false,
    accounts: [
      { accountNo: "FD00921", name: "John Ng'ongo", product: "Fixed Deposit", value: 3200000 },
      { accountNo: "BF00071", name: "John Ng'ongo", product: "Bond Fund", value: 5400000 },
      { accountNo: "MM00044", name: "John Ng'ongo", product: "Money Market Fund", value: 1750000 },
    ],
    beneficiaries: [
      { salutation: "Mrs", firstName: "Ruth", lastName: "Ng'ongo", relationship: "Spouse", mobile: "+254 7•• ••• 611", email: "r*****@gmail.com" },
    ],
    pepAnswers: { politicalAffiliation: false, publicOffice: false, currentPosition: false },
    taxExempt: false,
    documents: docs({
      "ID Front Image": { status: "verified", fileName: "id_front.jpg", date: "26 May 2022" },
      "ID Back Image": { status: "verified", fileName: "id_back.jpg", date: "26 May 2022" },
      "Verified ID Copy": { status: "verified", fileName: "verified_id.pdf", date: "27 May 2022" },
      "Signature Image": { status: "verified", fileName: "signature.png", date: "26 May 2022" },
      "KRA Copy": { status: "verified", fileName: "kra.pdf", date: "27 May 2022" },
      "Face Verification Photo": { status: "verified", fileName: "face_verify.jpg", date: "26 May 2022" },
    }),
  },
  {
    cifId: "000311",
    salutation: "Ms",
    firstName: "Susan",
    lastName: "Thuku",
    gender: "Female",
    dob: "1990-02-17",
    customerType: "Individual",
    idType: "NATID",
    idNumber: "13440067",
    idMasked: "13****67",
    kraNumber: "A009112288M",
    phone: "+254720000003",
    phoneMasked: "+254 7•• ••• 003",
    email: "susan.thuku@gmail.com",
    emailMasked: "n*****@gmail.com",
    nationality: "Kenyan",
    countryOfResidence: "Kenya",
    city: "Nakuru",
    physicalAddress: "Milimani",
    occupation: "Pharmacist",
    dateOnboarded: "12 Jul 2022",
    kyc: "pending",
    pep: false,
    accounts: [{ accountNo: "CL00733", name: "Susan Thuku", product: "Call Deposit", value: 640000 }],
    beneficiaries: [],
    pepAnswers: { politicalAffiliation: false, publicOffice: false, currentPosition: false },
    taxExempt: false,
    documents: docs({
      "ID Front Image": { status: "uploaded", fileName: "id_front.jpg", date: "12 Jul 2022" },
      "ID Back Image": { status: "uploaded", fileName: "id_back.jpg", date: "12 Jul 2022" },
    }),
  },
  {
    cifId: "000420",
    salutation: "Mr",
    firstName: "Andrew",
    lastName: "Muiyuro",
    gender: "Male",
    dob: "1979-11-28",
    customerType: "Individual",
    idType: "NATID",
    idNumber: "33110000",
    idMasked: "33****00",
    kraNumber: "A002556677T",
    phone: "+254720000004",
    phoneMasked: "+254 7•• ••• 004",
    email: "andrew.muiyuro@gmail.com",
    emailMasked: "a*****@gmail.com",
    nationality: "Kenyan",
    countryOfResidence: "Kenya",
    city: "Nairobi",
    physicalAddress: "Karen",
    occupation: "Architect",
    dateOnboarded: "29 Aug 2022",
    kyc: "verified",
    pep: false,
    accounts: [
      { accountNo: "BF00120", name: "Andrew Muiyuro", product: "Bond Fund", value: 12400000 },
      { accountNo: "FD01002", name: "Andrew Muiyuro", product: "Fixed Deposit", value: 4000000 },
    ],
    beneficiaries: [],
    pepAnswers: { politicalAffiliation: false, publicOffice: false, currentPosition: false },
    taxExempt: true,
    taxNote: "Tax-exempt under registered charitable trust. Exemption certificate on file (KRA/EX/2022/0148).",
    documents: docs({
      "ID Front Image": { status: "verified", fileName: "id_front.jpg", date: "29 Aug 2022" },
      "ID Back Image": { status: "verified", fileName: "id_back.jpg", date: "29 Aug 2022" },
      "Verified ID Copy": { status: "verified", fileName: "verified_id.pdf", date: "30 Aug 2022" },
      "KRA Copy": { status: "verified", fileName: "kra.pdf", date: "30 Aug 2022" },
      "Passport Copy": { status: "uploaded", fileName: "passport.jpg", date: "29 Aug 2022" },
    }),
  },
  {
    cifId: "000517",
    salutation: "Mr",
    firstName: "Peter",
    lastName: "Kamau",
    gender: "Male",
    dob: "1968-06-09",
    customerType: "Individual",
    idType: "Passport",
    idNumber: "A9345612",
    idMasked: "A9****12",
    kraNumber: "A007889900L",
    phone: "+254720000088",
    phoneMasked: "+254 7•• ••• 088",
    email: "peter.kamau@yahoo.com",
    emailMasked: "p*****@yahoo.com",
    nationality: "Kenyan",
    countryOfResidence: "Kenya",
    city: "Kisumu",
    physicalAddress: "Milimani",
    occupation: "Member of Parliament",
    dateOnboarded: "03 Sep 2022",
    kyc: "verified",
    pep: true,
    accounts: [
      { accountNo: "BF00201", name: "Peter Kamau", product: "Bond Fund", value: 21000000 },
      { accountNo: "CL00901", name: "Peter Kamau", product: "Call Deposit", value: 5600000 },
      { accountNo: "FD01188", name: "Peter Kamau", product: "Fixed Deposit", value: 9000000 },
      { accountNo: "MM00512", name: "Peter Kamau", product: "Money Market Fund", value: 3200000 },
    ],
    beneficiaries: [
      { salutation: "Mrs", firstName: "Jane", lastName: "Kamau", relationship: "Spouse", mobile: "+254 7•• ••• 401", email: "j*****@yahoo.com" },
    ],
    pepAnswers: {
      politicalAffiliation: true,
      publicOffice: true,
      currentPosition: true,
      details: "Member of Parliament (current term). Enhanced due diligence and source-of-funds verification required.",
    },
    taxExempt: false,
    documents: docs({
      "ID Front Image": { status: "verified", fileName: "id_front.jpg", date: "03 Sep 2022" },
      "Verified ID Copy": { status: "verified", fileName: "verified_id.pdf", date: "04 Sep 2022" },
      "Passport Copy": { status: "verified", fileName: "passport.jpg", date: "03 Sep 2022" },
      "KRA Copy": { status: "verified", fileName: "kra.pdf", date: "04 Sep 2022" },
      "Signature Image": { status: "uploaded", fileName: "signature.png", date: "03 Sep 2022" },
    }),
  },
  {
    cifId: "000634",
    salutation: "Mrs",
    firstName: "Faith",
    lastName: "Wanjiru",
    gender: "Female",
    dob: "1982-08-21",
    customerType: "Individual",
    idType: "NATID",
    idNumber: "26550048",
    idMasked: "26****48",
    kraNumber: "A003344556N",
    phone: "+254720000121",
    phoneMasked: "+254 7•• ••• 121",
    email: "faith.wanjiru@gmail.com",
    emailMasked: "f*****@gmail.com",
    nationality: "Kenyan",
    countryOfResidence: "Kenya",
    city: "Thika",
    physicalAddress: "Section 9",
    occupation: "Accountant",
    dateOnboarded: "14 Oct 2022",
    kyc: "verified",
    pep: false,
    accounts: [{ accountNo: "MM00680", name: "Faith Wanjiru", product: "Money Market Fund", value: 980000 }],
    beneficiaries: [],
    pepAnswers: { politicalAffiliation: false, publicOffice: false, currentPosition: false },
    taxExempt: false,
    documents: docs({
      "ID Front Image": { status: "verified", fileName: "id_front.jpg", date: "14 Oct 2022" },
      "ID Back Image": { status: "verified", fileName: "id_back.jpg", date: "14 Oct 2022" },
      "KRA Copy": { status: "uploaded", fileName: "kra.pdf", date: "14 Oct 2022" },
    }),
  },
  {
    cifId: "000712",
    salutation: "Mr",
    firstName: "Samuel",
    lastName: "Otieno",
    gender: "Male",
    dob: "1993-03-30",
    customerType: "Individual",
    idType: "NATID",
    idNumber: "40221190",
    idMasked: "40****90",
    kraNumber: "A005566778R",
    phone: "+254720000144",
    phoneMasked: "+254 7•• ••• 144",
    email: "samuel.otieno@gmail.com",
    emailMasked: "s*****@gmail.com",
    nationality: "Kenyan",
    countryOfResidence: "Kenya",
    city: "Eldoret",
    physicalAddress: "Elgon View",
    occupation: "Software Engineer",
    dateOnboarded: "02 Nov 2022",
    kyc: "pending",
    pep: false,
    accounts: [],
    beneficiaries: [],
    pepAnswers: { politicalAffiliation: false, publicOffice: false, currentPosition: false },
    taxExempt: false,
    documents: docs({
      "ID Front Image": { status: "uploaded", fileName: "id_front.jpg", date: "02 Nov 2022" },
    }),
  },
];

export function fullName(c: Customer): string {
  return [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" ");
}

export function initials(c: Customer): string {
  return `${c.firstName[0] ?? ""}${c.lastName[0] ?? ""}`.toUpperCase();
}

export function getCustomer(cifId: string): Customer | undefined {
  return customers.find((c) => c.cifId === cifId);
}

/** Mutates the in-memory customers array — replace with an API call in production */
export function updateCustomer(cifId: string, patch: Partial<Customer>): Customer | undefined {
  const idx = customers.findIndex((c) => c.cifId === cifId);
  if (idx === -1) return undefined;
  customers[idx] = { ...customers[idx], ...patch };
  return customers[idx];
}
