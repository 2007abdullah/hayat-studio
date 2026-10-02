"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FileText, Inbox, LayoutDashboard, Layers, Users, Sparkles } from "lucide-react";
import clsx from "clsx";
import RequireAuth from "@/components/RequireAuth";

const nav = [
  ["/admin", "Overview", LayoutDashboard], ["/admin/orders", "Orders", Inbox], ["/admin/clients", "Clients", Users], ["/admin/services", "Services", Layers],
  ["/admin/projects", "Projects", Briefcase], ["/admin/content", "Content", Sparkles], ["/admin/contact", "Inquiries", FileText],
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <RequireAuth role="admin">
      <div className="container-x pb-12 pt-24">
        <nav aria-label="Admin" className="-mx-1 mb-8 flex gap-1 overflow-x-auto pb-2">
          {nav.map(([href, label, Icon]) => {
            const active = href === "/admin" ? path === href : path.startsWith(href);
            return <Link key={href} href={href} className={clsx("inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition", active ? "bg-raised text-fg" : "text-muted hover:text-fg")}><Icon className="h-4 w-4" />{label}</Link>;
          })}
        </nav>
        {children}
      </div>
    </RequireAuth>
  );
}
