import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronsLeft, ChevronsRight, ChevronUp,
  LayoutDashboard, UserCog, Package, ArrowLeftRight,
  LayoutGrid, Building2, BarChart3, FileText, ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRole } from "../lib/RoleContext";
import type { UserRole } from "../lib/roles";

interface ModuleDef {
  icon: LucideIcon;
  label: string;
  to: string;
}

const topModules: ModuleDef[] = [{ icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" }];

const amSubs = [
  { label: "Onboard Customer",     to: "/onboard-customer" },
  { label: "Customers",            to: "/customers" },
  { label: "Investment Accounts",  to: "/investment-accounts" },
  { label: "Account Lien",         to: "/account-lien" },
];

const txSubs = [
  { label: "Deposits",    to: "/transactions/deposits" },
  { label: "Withdrawals", to: "/transactions/withdrawals" },
];

const bottomModules: ModuleDef[] = [
  { icon: Package, label: "Product Maintenance", to: "/product-maintenance" },
  { icon: LayoutGrid, label: "Operations", to: "/operations" },
  { icon: Building2, label: "Department", to: "/department" },
  { icon: BarChart3, label: "Reports", to: "/reports" },
  { icon: FileText, label: "Statement Management", to: "/statements" },
];

function ModuleLink({ mod, collapsed }: { mod: ModuleDef; collapsed: boolean }) {
  const Icon = mod.icon;
  return (
    <NavLink
      to={mod.to}
      title={collapsed ? mod.label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
          isActive ? "bg-nav-active text-white font-semibold" : "text-nav-muted hover:text-white"
        }`
      }
    >
      <Icon size={18} strokeWidth={1.75} className="shrink-0" />
      {!collapsed && <span className="truncate">{mod.label}</span>}
    </NavLink>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [roleOpen, setRoleOpen]   = useState(false);
  const { pathname } = useLocation();
  const { role, setRole } = useRole();
  const amActive = amSubs.some((s) => pathname.startsWith(s.to));
  const txActive = txSubs.some((s) => pathname.startsWith(s.to));
  const roleRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roleOpen) return;
    function onDown(e: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [roleOpen]);

  const roleLabels: Record<UserRole, { label: string; sub: string }> = {
    maker:   { label: "John Mwangi",  sub: "Maker" },
    checker: { label: "John Mwangi",  sub: "Checker" },
    admin:   { label: "John Mwangi",  sub: "Admin" },
  };

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-[232px]"} bg-primary flex flex-col shrink-0 transition-[width] duration-200`} /* ds-ok: fixed sidebar rail widths */
    >
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-white/10 shrink-0">
        <div className="w-7 h-7 rounded-md bg-cta flex items-center justify-center text-white font-bold text-sm shrink-0">
          C
        </div>
        {!collapsed && <span className="text-white text-sm font-semibold whitespace-nowrap">CISL Core</span>}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto text-nav-muted hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5 flex flex-col gap-0.5">
        {topModules.map((m) => (
          <ModuleLink key={m.to} mod={m} collapsed={collapsed} />
        ))}

        {/* Account Maintenance — expandable parent */}
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${
            amActive ? "bg-nav-active text-white font-semibold" : "text-nav-muted"
          }`}
        >
          <UserCog size={18} strokeWidth={1.75} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="truncate">Account Maintenance</span>
              <ChevronUp size={14} className="ml-auto shrink-0" />
            </>
          )}
        </div>
        {!collapsed && (
          <div className="flex flex-col gap-0.5 ml-3.5 pl-2.5 border-l border-white/15 my-1">
            {amSubs.map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive ? "bg-cta text-white font-semibold" : "text-nav-muted hover:text-white"
                  }`
                }
              >
                {s.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Transactions — expandable parent */}
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${
            txActive ? "bg-nav-active text-white font-semibold" : "text-nav-muted"
          }`}
        >
          <ArrowLeftRight size={18} strokeWidth={1.75} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="truncate">Transactions</span>
              <ChevronUp size={14} className="ml-auto shrink-0" />
            </>
          )}
        </div>
        {!collapsed && (
          <div className="flex flex-col gap-0.5 ml-3.5 pl-2.5 border-l border-white/15 my-1">
            {txSubs.map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive ? "bg-cta text-white font-semibold" : "text-nav-muted hover:text-white"
                  }`
                }
              >
                {s.label}
              </NavLink>
            ))}
          </div>
        )}

        {bottomModules.map((m) => (
          <ModuleLink key={m.to} mod={m} collapsed={collapsed} />
        ))}
      </nav>

      <div ref={roleRef} className="mt-auto border-t border-white/10 shrink-0 relative">
        <button
          onClick={() => setRoleOpen((o) => !o)}
          className="w-full px-4 py-3.5 flex items-center gap-2.5 hover:bg-nav-active transition-colors"
          aria-label="Switch role"
        >
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white text-xs font-semibold shrink-0">
            JM
          </div>
          {!collapsed && (
            <>
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="text-white text-xs font-semibold truncate">{roleLabels[role].label}</span>
                <span className="text-nav-muted text-xs truncate">{roleLabels[role].sub}</span>
              </div>
              <ChevronDown size={14} className={`text-nav-muted transition-transform shrink-0 ${roleOpen ? "rotate-180" : ""}`} />
            </>
          )}
        </button>

        {/* Role switcher popover */}
        {roleOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-30">
            <div className="px-3 py-2 border-b border-border">
              <span className="t-label text-muted-foreground">Switch role (dev)</span>
            </div>
            {(["maker", "checker", "admin"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => { setRole(r); setRoleOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 t-body transition-colors text-left ${
                  role === r ? "bg-success-bg text-success-fg font-medium" : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="capitalize">{r}</span>
                {role === r && <span className="t-label text-success-fg">Active</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
