import { createContext, useContext, useState, type ReactNode } from "react";
import type { UserRole } from "./roles";

interface RoleContextValue {
  role: UserRole;
  setRole: (r: UserRole) => void;
}

const RoleContext = createContext<RoleContextValue>({ role: "maker", setRole: () => {} });

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("maker");
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}
