"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, fmtDate } from "@/lib/api";
import { EmptyState, Skeleton, StatusBadge } from "@/components/ui/misc";
import { PRIORITIES, STATUSES, type Order } from "@/types";

export default function AdminOrders() {
  const [rows, setRows] = useState<Order[] | null>(null);
  const [q, setQ] = useState(""); const [status, setStatus] = useState(""); const [priority, setPriority] = useState(""); const [sort, setSort] = useState("newest");
  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams({ sort }); if (q) p.set("q", q); if (status) p.set("status", status); if (priority) p.set("priority", priority);
      api<Order[]>(`/orders?${p}`).then(setRows).catch(() => setRows([]));
    }, 250);
    return () => clearTimeout(t);
  }, [q, status, priority, sort]);
  return (
    <div className="space-y-6">
      <h1 className="h2">Orders</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div><label htmlFor="q" className="sr-only">Search orders</label><input id="q" className="input" placeholder="Search number, client, project" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select aria-label="Filter by status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select aria-label="Filter by priority" className="input" value={priority} onChange={(e) => setPriority(e.target.value)}><option value="">All priorities</option>{PRIORITIES.map((s) => <option key={s}>{s}</option>)}</select>
        <select aria-label="Sort" className="input" value={sort} onChange={(e) => setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>
      </div>
      {rows === null ? <Skeleton className="h-64" /> : rows.length === 0 ? <EmptyState title="No orders found" text="New orders appear here the moment clients submit them." /> : (
        <div className="table-wrap"><table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-raised/60 text-xs text-muted"><tr>{["Order", "Client", "Service", "Status", "Priority", "Submitted"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>{rows.map((o) => (
            <tr key={o.id} className="border-t border-line transition hover:bg-raised/40">
              <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-mono text-accent hover:underline">{o.order_number}</Link><p className="text-xs text-muted">{o.project_title}</p></td>
              <td className="px-4 py-3">{o.client_name}<p className="text-xs text-muted">{o.client_email}</p></td>
              <td className="px-4 py-3">{o.service_title}</td><td className="px-4 py-3"><StatusBadge value={o.status} /></td><td className="px-4 py-3"><StatusBadge value={o.priority} /></td><td className="px-4 py-3 text-muted">{fmtDate(o.created_at)}</td>
            </tr>))}</tbody></table></div>
      )}
    </div>
  );
}
