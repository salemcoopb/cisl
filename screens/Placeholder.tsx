import { Construction } from "lucide-react";
import { TopBar } from "../components/TopBar";

export function Placeholder({ title }: { title: string }) {
  return (
    <>
      <TopBar crumbs={[{ label: title }]} />
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
          <Construction size={26} strokeWidth={1.75} className="text-gold" />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          This module isn't part of the current design scope. The Customers module and Account Inquiry are fully
          built out — explore those from the sidebar.
        </p>
      </div>
    </>
  );
}
