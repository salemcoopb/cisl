import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
