export interface Holding {
  instrument: string;
  type: string;
  value: number;
  pct: number;
}

export interface AccountTxn {
  date: string;
  type: string;        // e.g. "CR", "DR"
  amount: number;
  reference: string;
  runningBalance: number;
  currency: string;
  narration: string;
  // legacy
  desc?: string;
  category?: string;
  status?: "Settled" | "Pending" | "Failed";
}

export interface WithdrawalBank {
  method: "bank";
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  swiftCode: string;
  branch: string;
  branchCode: string;
  addressLine1: string;
  city: string;
  country: string;
  postalAddress: string;
  postalCode: string;
}

export interface WithdrawalMobile {
  method: "mobile";
  provider: string;
  phoneNumber: string;
  accountName: string;
}

export type WithdrawalMethod = WithdrawalBank | WithdrawalMobile;

export interface AccountDetail {
  accountNo: string;
  holderName: string;
  cifId?: string;
  accountType: "Individual" | "Corporate" | "Joint";
  product: string;
  type: string;
  currency: string;
  status: "Active" | "Dormant" | "Closed";
  kyc: "KYC Verified" | "KYC Pending";
  rm: string;
  createdBy: string;
  opened: string;
  // Balances
  investmentBalance: number;
  depositBalance: number;
  lienAmount: number;
  totalBalance: number;
  // legacy aliases
  totalValue: number;
  availableCash: number;
  invested: number;
  accruedInterest: number;
  // Signing instructions
  signingInstructions?: string;
  // Withdrawal — primary is required, secondary is optional
  primaryWithdrawal?: WithdrawalMethod;
  secondaryWithdrawal?: WithdrawalMethod;
  holdings: Holding[];
  transactions: AccountTxn[];
}

export const accounts: Record<string, AccountDetail> = {
  CL00385: {
    accountNo: "CL00385", holderName: "Margaret Nungari Muiruri", cifId: "000001",
    accountType: "Individual", product: "Co-op Money Market Fund", type: "Individual — Money Market Fund",
    currency: "KES", status: "Active", kyc: "KYC Verified", rm: "J. Kariuki", createdBy: "J. Kariuki",
    opened: "18 May 2022",
    investmentBalance: 2000000, depositBalance: 450000, lienAmount: 0, totalBalance: 2450000,
    totalValue: 2450000, availableCash: 450000, invested: 2000000, accruedInterest: 18400,
    signingInstructions: "Single signatory. Account holder only.",
    primaryWithdrawal: { method: "bank", bankName: "Equity Bank", accountName: "Margaret N. Muiruri", accountNumber: "0123456789", bankCode: "68", swiftCode: "EQBLKENA", branch: "Westlands", branchCode: "0055", addressLine1: "Equity Centre, Upper Hill", city: "Nairobi", country: "Kenya", postalAddress: "75104", postalCode: "00200" },
    secondaryWithdrawal: { method: "mobile", provider: "M-Pesa", phoneNumber: "+254712000055", accountName: "Margaret Muiruri" },
    holdings: [
      { instrument: "Co-op Money Market Fund", type: "MMF",  value: 2000000, pct: 82 },
      { instrument: "Cash",                    type: "Cash", value: 450000,  pct: 18 },
    ],
    transactions: [
      { date: "10 Feb 2026", type: "CR", amount: 500000,  reference: "TXN-2026-001", runningBalance: 2450000, currency: "KES", narration: "Deposit received" },
      { date: "01 Feb 2026", type: "CR", amount: 18400,   reference: "TXN-2026-002", runningBalance: 1950000, currency: "KES", narration: "Interest credited" },
      { date: "22 Jan 2026", type: "DR", amount: 300000,  reference: "TXN-2026-003", runningBalance: 1931600, currency: "KES", narration: "Partial withdrawal" },
    ],
  },
  BF00003: {
    accountNo: "BF00003", holderName: "Margaret Nungari Muiruri", cifId: "000001",
    accountType: "Individual", product: "Co-op Bond Fund", type: "Individual — Co-op Bond Fund",
    currency: "KES", status: "Active", kyc: "KYC Verified", rm: "J. Kariuki", createdBy: "S. Ngigi",
    opened: "18 May 2022",
    investmentBalance: 5970000, depositBalance: 210000, lienAmount: 0, totalBalance: 6180000,
    totalValue: 6180000, availableCash: 210000, invested: 5970000, accruedInterest: 142300,
    signingInstructions: "Single signatory. Account holder only.",
    primaryWithdrawal: { method: "bank", bankName: "KCB Bank", accountName: "Margaret N. Muiruri", accountNumber: "9876543210", bankCode: "01", swiftCode: "KCBLKENX", branch: "CBD", branchCode: "0001", addressLine1: "Kencom House, Moi Avenue", city: "Nairobi", country: "Kenya", postalAddress: "30081", postalCode: "00100" },
    holdings: [
      { instrument: "Treasury Bond FXD1/2034", type: "Bond",   value: 3600000, pct: 58 },
      { instrument: "Treasury Bond IFB1/2031", type: "Bond",   value: 1800000, pct: 29 },
      { instrument: "Treasury Bill 364-day",   type: "T-Bill", value: 570000,  pct:  9 },
      { instrument: "Cash",                    type: "Cash",   value: 210000,  pct:  4 },
    ],
    transactions: [
      { date: "14 Feb 2026", type: "DR", amount: 1500000, reference: "TXN-2026-010", runningBalance: 6180000, currency: "KES", narration: "Bond purchase FXD1/2034" },
      { date: "01 Feb 2026", type: "CR", amount: 142300,  reference: "TXN-2026-011", runningBalance: 7680000, currency: "KES", narration: "Coupon received" },
      { date: "20 Jan 2026", type: "CR", amount: 570000,  reference: "TXN-2026-012", runningBalance: 7537700, currency: "KES", narration: "T-Bill maturity" },
    ],
  },
  "CISL-CORP-0042189": {
    accountNo: "CISL-CORP-0042189", holderName: "Acme Holdings Ltd",
    accountType: "Corporate", product: "Co-op Fixed Income Gratuity Fund", type: "Corporate — Fixed Income",
    currency: "KES", status: "Active", kyc: "KYC Verified", rm: "J. Kariuki", createdBy: "M. Wairimu",
    opened: "12 Mar 2021",
    investmentBalance: 44800000, depositBalance: 3120400, lienAmount: 5000000, totalBalance: 48250000,
    totalValue: 48250000, availableCash: 3120400, invested: 44800000, accruedInterest: 329600,
    signingInstructions: "Joint signatories — any two of: CEO, CFO, Company Secretary.",
    primaryWithdrawal: { method: "bank", bankName: "Standard Chartered", accountName: "Acme Holdings Ltd", accountNumber: "1122334455", bankCode: "02", swiftCode: "SCBLKENX", branch: "Upper Hill", branchCode: "0014", addressLine1: "Standard Chartered Tower, Chiromo Road", city: "Nairobi", country: "Kenya", postalAddress: "30003", postalCode: "00100" },
    holdings: [
      { instrument: "Treasury Bond FXD1/2034", type: "Bond",   value: 22400000, pct: 46 },
      { instrument: "Safaricom PLC",           type: "Equity", value: 11900000, pct: 25 },
      { instrument: "Fixed Deposit — 90 day",  type: "FD",     value:  7500000, pct: 15 },
      { instrument: "Treasury Bill 364-day",   type: "T-Bill", value:  3000000, pct:  6 },
      { instrument: "Cash",                    type: "Cash",   value:  3450000, pct:  8 },
    ],
    transactions: [
      { date: "14 Feb 2026", type: "DR", amount: 5000000, reference: "TXN-2026-020", runningBalance: 48250000, currency: "KES", narration: "Bond purchase FXD1/2034" },
      { date: "01 Feb 2026", type: "CR", amount: 329600,  reference: "TXN-2026-021", runningBalance: 53250000, currency: "KES", narration: "Coupon received" },
      { date: "28 Jan 2026", type: "DR", amount: 1200000, reference: "TXN-2026-022", runningBalance: 52920400, currency: "KES", narration: "Withdrawal request" },
      { date: "20 Jan 2026", type: "CR", amount: 7500000, reference: "TXN-2026-023", runningBalance: 54120400, currency: "KES", narration: "FD rollover 90 day" },
    ],
  },
  CL00512: {
    accountNo: "CL00512", holderName: "Agnes Masimane", cifId: "000148",
    accountType: "Individual", product: "Co-op Money Market Fund", type: "Individual — Money Market Fund",
    currency: "KES", status: "Active", kyc: "KYC Verified", rm: "A. Odhiambo", createdBy: "A. Odhiambo",
    opened: "26 May 2022",
    investmentBalance: 8000000, depositBalance: 900000, lienAmount: 0, totalBalance: 8900000,
    totalValue: 8900000, availableCash: 900000, invested: 8000000, accruedInterest: 62000,
    signingInstructions: "Single signatory.",
    primaryWithdrawal: { method: "mobile", provider: "M-Pesa", phoneNumber: "+254720000001", accountName: "Agnes Masimane" },
    holdings: [
      { instrument: "Co-op Money Market Fund", type: "MMF",  value: 8000000, pct: 90 },
      { instrument: "Cash",                    type: "Cash", value: 900000,  pct: 10 },
    ],
    transactions: [
      { date: "05 Feb 2026", type: "CR", amount: 1000000, reference: "TXN-2026-030", runningBalance: 8900000, currency: "KES", narration: "Deposit received" },
    ],
  },
  FD00921: {
    accountNo: "FD00921", holderName: "John Ng'ongo", cifId: "000203",
    accountType: "Individual", product: "Co-op Fixed Income Gratuity Fund", type: "Individual — Fixed Income",
    currency: "KES", status: "Active", kyc: "KYC Verified", rm: "J. Kariuki", createdBy: "S. Ngigi",
    opened: "26 May 2022",
    investmentBalance: 3200000, depositBalance: 0, lienAmount: 500000, totalBalance: 3200000,
    totalValue: 3200000, availableCash: 0, invested: 3200000, accruedInterest: 28800,
    signingInstructions: "Single signatory.",
    primaryWithdrawal: { method: "bank", bankName: "Co-operative Bank", accountName: "John Ng'ongo", accountNumber: "4455667788", bankCode: "11", swiftCode: "KCOOKENAXXXX", branch: "Mombasa", branchCode: "0040", addressLine1: "Co-op House, Haile Selassie Avenue", city: "Mombasa", country: "Kenya", postalAddress: "84100", postalCode: "80100" },
    secondaryWithdrawal: { method: "mobile", provider: "M-Pesa", phoneNumber: "+254720000002", accountName: "John Ng'ongo" },
    holdings: [{ instrument: "Co-op Fixed Income Gratuity Fund", type: "FI", value: 3200000, pct: 100 }],
    transactions: [
      { date: "01 Jan 2026", type: "CR", amount: 3200000, reference: "TXN-2026-040", runningBalance: 3200000, currency: "KES", narration: "Fund rollover" },
    ],
  },
  MM00680: {
    accountNo: "MM00680", holderName: "Faith Wanjiru", cifId: "000634",
    accountType: "Individual", product: "Co-op Money Market Fund", type: "Individual — Money Market Fund",
    currency: "KES", status: "Active", kyc: "KYC Verified", rm: "M. Wairimu", createdBy: "M. Wairimu",
    opened: "14 Oct 2022",
    investmentBalance: 980000, depositBalance: 0, lienAmount: 0, totalBalance: 980000,
    totalValue: 980000, availableCash: 980000, invested: 0, accruedInterest: 4200,
    signingInstructions: "Single signatory.",
    primaryWithdrawal: { method: "mobile", provider: "M-Pesa", phoneNumber: "+254720000121", accountName: "Faith Wanjiru" },
    holdings: [{ instrument: "Co-op Money Market Fund", type: "MMF", value: 980000, pct: 100 }],
    transactions: [
      { date: "01 Feb 2026", type: "CR", amount: 4200, reference: "TXN-2026-050", runningBalance: 980000, currency: "KES", narration: "Interest credited" },
    ],
  },
  BF00071: { accountNo: "BF00071", holderName: "John Ng'ongo", cifId: "000203", accountType: "Individual", product: "Co-op Bond Fund", type: "Individual — Bond Fund", currency: "KES", status: "Active", kyc: "KYC Verified", rm: "J. Kariuki", createdBy: "J. Kariuki", opened: "26 May 2022", investmentBalance: 5400000, depositBalance: 0, lienAmount: 0, totalBalance: 5400000, totalValue: 5400000, availableCash: 0, invested: 5400000, accruedInterest: 112000, signingInstructions: "Single signatory.", primaryWithdrawal: { method: "mobile", provider: "M-Pesa", phoneNumber: "+254720000002", accountName: "John Ng'ongo" }, holdings: [{ instrument: "Co-op Bond Fund", type: "Bond", value: 5400000, pct: 100 }], transactions: [{ date: "01 Feb 2026", type: "CR", amount: 112000, reference: "TXN-B071-01", runningBalance: 5400000, currency: "KES", narration: "Coupon received" }] },
  MM00044: { accountNo: "MM00044", holderName: "John Ng'ongo", cifId: "000203", accountType: "Individual", product: "Co-op Money Market Fund", type: "Individual — MMF", currency: "KES", status: "Active", kyc: "KYC Verified", rm: "J. Kariuki", createdBy: "S. Ngigi", opened: "26 May 2022", investmentBalance: 1750000, depositBalance: 0, lienAmount: 0, totalBalance: 1750000, totalValue: 1750000, availableCash: 1750000, invested: 0, accruedInterest: 8200, signingInstructions: "Single signatory.", primaryWithdrawal: { method: "mobile", provider: "M-Pesa", phoneNumber: "+254720000002", accountName: "John Ng'ongo" }, holdings: [{ instrument: "Co-op Money Market Fund", type: "MMF", value: 1750000, pct: 100 }], transactions: [{ date: "01 Feb 2026", type: "CR", amount: 8200, reference: "TXN-M044-01", runningBalance: 1750000, currency: "KES", narration: "Interest credited" }] },
  CL00733: { accountNo: "CL00733", holderName: "Susan Thuku", cifId: "000311", accountType: "Individual", product: "Co-op Money Market Fund", type: "Individual — MMF", currency: "KES", status: "Active", kyc: "KYC Pending", rm: "M. Wairimu", createdBy: "M. Wairimu", opened: "12 Jul 2022", investmentBalance: 640000, depositBalance: 0, lienAmount: 0, totalBalance: 640000, totalValue: 640000, availableCash: 640000, invested: 0, accruedInterest: 1800, signingInstructions: "Single signatory.", primaryWithdrawal: { method: "mobile", provider: "M-Pesa", phoneNumber: "+254720000003", accountName: "Susan Thuku" }, holdings: [{ instrument: "Co-op Money Market Fund", type: "MMF", value: 640000, pct: 100 }], transactions: [{ date: "01 Feb 2026", type: "CR", amount: 1800, reference: "TXN-C733-01", runningBalance: 640000, currency: "KES", narration: "Interest credited" }] },
  BF00120: { accountNo: "BF00120", holderName: "Andrew Muiyuro", cifId: "000420", accountType: "Individual", product: "Co-op Bond Fund", type: "Individual — Bond Fund", currency: "KES", status: "Active", kyc: "KYC Verified", rm: "J. Kariuki", createdBy: "J. Kariuki", opened: "29 Aug 2022", investmentBalance: 12400000, depositBalance: 0, lienAmount: 0, totalBalance: 12400000, totalValue: 12400000, availableCash: 0, invested: 12400000, accruedInterest: 298000, signingInstructions: "Single signatory.", primaryWithdrawal: { method: "bank", bankName: "Equity Bank", accountName: "Andrew Muiyuro", accountNumber: "7788990011", bankCode: "68", swiftCode: "EQBLKENA", branch: "Karen", branchCode: "0066", addressLine1: "Karen Shopping Centre", city: "Nairobi", country: "Kenya", postalAddress: "24722", postalCode: "00502" }, holdings: [{ instrument: "Co-op Bond Fund", type: "Bond", value: 12400000, pct: 100 }], transactions: [{ date: "01 Feb 2026", type: "CR", amount: 298000, reference: "TXN-B120-01", runningBalance: 12400000, currency: "KES", narration: "Coupon received" }] },
  FD01002: { accountNo: "FD01002", holderName: "Andrew Muiyuro", cifId: "000420", accountType: "Individual", product: "Co-op Fixed Income Gratuity Fund", type: "Individual — Fixed Income", currency: "KES", status: "Active", kyc: "KYC Verified", rm: "J. Kariuki", createdBy: "A. Odhiambo", opened: "29 Aug 2022", investmentBalance: 4000000, depositBalance: 0, lienAmount: 0, totalBalance: 4000000, totalValue: 4000000, availableCash: 0, invested: 4000000, accruedInterest: 52000, signingInstructions: "Single signatory.", primaryWithdrawal: { method: "bank", bankName: "Equity Bank", accountName: "Andrew Muiyuro", accountNumber: "7788990011", bankCode: "68", swiftCode: "EQBLKENA", branch: "Karen", branchCode: "0066", addressLine1: "Karen Shopping Centre", city: "Nairobi", country: "Kenya", postalAddress: "24722", postalCode: "00502" }, holdings: [{ instrument: "Co-op Fixed Income Gratuity Fund", type: "FI", value: 4000000, pct: 100 }], transactions: [{ date: "01 Feb 2026", type: "CR", amount: 52000, reference: "TXN-F002-01", runningBalance: 4000000, currency: "KES", narration: "Interest credited" }] },
  BF00201: { accountNo: "BF00201", holderName: "Peter Kamau", cifId: "000517", accountType: "Individual", product: "Co-op Bond Fund", type: "Individual — Bond Fund", currency: "KES", status: "Active", kyc: "KYC Verified", rm: "A. Odhiambo", createdBy: "A. Odhiambo", opened: "03 Sep 2022", investmentBalance: 21000000, depositBalance: 0, lienAmount: 2000000, totalBalance: 21000000, totalValue: 21000000, availableCash: 0, invested: 21000000, accruedInterest: 520000, signingInstructions: "Single signatory.", primaryWithdrawal: { method: "bank", bankName: "Standard Chartered", accountName: "Peter Kamau", accountNumber: "5566778899", bankCode: "02", swiftCode: "SCBLKENX", branch: "Kisumu", branchCode: "0020", addressLine1: "Mega Plaza, Oginga Odinga Street", city: "Kisumu", country: "Kenya", postalAddress: "1000", postalCode: "40100" }, holdings: [{ instrument: "Co-op Bond Fund", type: "Bond", value: 21000000, pct: 100 }], transactions: [{ date: "01 Feb 2026", type: "CR", amount: 520000, reference: "TXN-B201-01", runningBalance: 21000000, currency: "KES", narration: "Coupon received" }] },
  CL00901: { accountNo: "CL00901", holderName: "Peter Kamau", cifId: "000517", accountType: "Individual", product: "Co-op Money Market Fund", type: "Individual — MMF", currency: "KES", status: "Active", kyc: "KYC Verified", rm: "A. Odhiambo", createdBy: "M. Wairimu", opened: "03 Sep 2022", investmentBalance: 5600000, depositBalance: 0, lienAmount: 0, totalBalance: 5600000, totalValue: 5600000, availableCash: 5600000, invested: 0, accruedInterest: 28000, signingInstructions: "Single signatory.", primaryWithdrawal: { method: "mobile", provider: "M-Pesa", phoneNumber: "+254720000088", accountName: "Peter Kamau" }, holdings: [{ instrument: "Co-op Money Market Fund", type: "MMF", value: 5600000, pct: 100 }], transactions: [{ date: "01 Feb 2026", type: "CR", amount: 28000, reference: "TXN-C901-01", runningBalance: 5600000, currency: "KES", narration: "Interest credited" }] },
  FD01188: { accountNo: "FD01188", holderName: "Peter Kamau", cifId: "000517", accountType: "Individual", product: "Co-op Fixed Income Gratuity Fund", type: "Individual — Fixed Income", currency: "KES", status: "Active", kyc: "KYC Verified", rm: "A. Odhiambo", createdBy: "A. Odhiambo", opened: "03 Sep 2022", investmentBalance: 9000000, depositBalance: 0, lienAmount: 0, totalBalance: 9000000, totalValue: 9000000, availableCash: 0, invested: 9000000, accruedInterest: 195000, signingInstructions: "Single signatory.", primaryWithdrawal: { method: "bank", bankName: "Standard Chartered", accountName: "Peter Kamau", accountNumber: "5566778899", bankCode: "02", swiftCode: "SCBLKENX", branch: "Kisumu", branchCode: "0020", addressLine1: "Mega Plaza, Oginga Odinga Street", city: "Kisumu", country: "Kenya", postalAddress: "1000", postalCode: "40100" }, holdings: [{ instrument: "Co-op Fixed Income Gratuity Fund", type: "FI", value: 9000000, pct: 100 }], transactions: [{ date: "01 Feb 2026", type: "CR", amount: 195000, reference: "TXN-F188-01", runningBalance: 9000000, currency: "KES", narration: "Interest credited" }] },
  MM00512: { accountNo: "MM00512", holderName: "Peter Kamau", cifId: "000517", accountType: "Individual", product: "Co-op Money Market Fund", type: "Individual — MMF", currency: "KES", status: "Active", kyc: "KYC Verified", rm: "A. Odhiambo", createdBy: "S. Ngigi", opened: "03 Sep 2022", investmentBalance: 3200000, depositBalance: 0, lienAmount: 0, totalBalance: 3200000, totalValue: 3200000, availableCash: 3200000, invested: 0, accruedInterest: 14000, signingInstructions: "Single signatory.", primaryWithdrawal: { method: "mobile", provider: "M-Pesa", phoneNumber: "+254720000088", accountName: "Peter Kamau" }, holdings: [{ instrument: "Co-op Money Market Fund", type: "MMF", value: 3200000, pct: 100 }], transactions: [{ date: "01 Feb 2026", type: "CR", amount: 14000, reference: "TXN-M512-01", runningBalance: 3200000, currency: "KES", narration: "Interest credited" }] },
};

export function getAccount(no: string): AccountDetail | undefined {
  return accounts[no];
}

export const accountList = Object.values(accounts);
export const recentAccounts = ["CISL-CORP-0042189", "BF00003", "CL00385"];
