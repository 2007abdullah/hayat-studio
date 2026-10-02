"use client";
import { useEffect, useState } from "react";
import { api, fmtDate } from "@/lib/api";
import { EmptyState, Skeleton } from "@/components/ui/misc";

type C = { id: number; full_name: string; email: string; company?: string; country?: string; created_at: string; orders: number };

export default function Clients() {
  const [rows, setRows] = useState<C[] | null>(null);
  useEffect(() => { api<C[]>("/admin/clients").then(setRows).catch(() => setRows([])); }, []);
  return (
    <div className="space-y-6"><h1 className="h2">Clients</h1>
      {rows === null ? <Skeleton className="h-48" /> : rows.length === 0 ? <EmptyState title="No clients yet" text="Clients appear when they create an account." /> : (
        <div className="table-wrap"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-raised/60 text-xs text-muted"><tr>{["Name", "Email", "Company", "Orders", "Joined"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>{rows.map((c) => <tr key={c.id} className="border-t border-line"><td className="px-4 py-3">{c.full_name}</td><td className="px-4 py-3">{c.email}</td><td className="px-4 py-3 text-muted">{c.company || "-"}</td><td className="px-4 py-3">{c.orders}</td><td className="px-4 py-3 text-muted">{fmtDate(c.created_at)}</td></tr>)}</tbody></table></div>)}
    </div>
  );
}
