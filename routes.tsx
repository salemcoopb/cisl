import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CustomersList } from "./screens/CustomersList";
import { CustomerProfile } from "./screens/CustomerProfile";
import { AccountInquiry } from "./screens/AccountInquiry";
import { InvestmentAccounts } from "./screens/InvestmentAccounts";
import { AccountLien } from "./screens/AccountLien";
import { Placeholder } from "./screens/Placeholder";
import { OnboardCustomer } from "./screens/OnboardCustomer";
import { Transactions } from "./screens/Transactions";
import { Withdrawals } from "./screens/Withdrawals";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/customers" replace />} />
        <Route path="/onboard-customer" element={<OnboardCustomer />} />
        <Route path="/customers" element={<CustomersList />} />
        <Route path="/customers/:cifId" element={<CustomerProfile />} />
        <Route path="/account-inquiry" element={<AccountInquiry />} />
        <Route path="/account-inquiry/:accountNo" element={<AccountInquiry />} />
        <Route path="/investment-accounts" element={<InvestmentAccounts />} />
        <Route path="/account-lien" element={<AccountLien />} />
        <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
        <Route path="/product-maintenance" element={<Placeholder title="Product Maintenance" />} />
        <Route path="/transactions" element={<Navigate to="/transactions/deposits" replace />} />
        <Route path="/transactions/deposits" element={<Transactions />} />
        <Route path="/transactions/withdrawals" element={<Withdrawals />} />
        <Route path="/operations" element={<Placeholder title="Operations" />} />
        <Route path="/department" element={<Placeholder title="Department" />} />
        <Route path="/reports" element={<Placeholder title="Reports" />} />
        <Route path="/statements" element={<Placeholder title="Statement Management" />} />
        <Route path="*" element={<Navigate to="/customers" replace />} />
      </Route>
    </Routes>
  );
}
