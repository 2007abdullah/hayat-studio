"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { fmtDate } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import Button from "@/components/ui/Button";
import { EmptyState, Skeleton, StatusBadge } from "@/components/ui/misc";
import type { Order } from "@/types";

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => { api<Order[]>("/orders").then(setOrders).catch(() => setOrders([])); }, []);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="h2">Your projects</h1><p className="text-muted">Signed in as {user?.email}</p></div><Button href="/order" arrow>New project</Button></div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {orders === null ? [0, 1].map((i) => <Skeleton key={i} className="h-36" />) : orders.length === 0 ? <div className="md:col-span-2"><EmptyState title="No projects yet" text="Orders placed with your email address appear here." action={<Button href="/order">Start a project</Button>} /></div> :
          orders.map((o) => (
            <Link key={o.id} href={`/dashboard/orders/${o.id}`} className="card block p-5 transition hover:-translate-y-0.5 hover:border-accent/50">
              <div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs text-muted">{o.order_number}</p><h2 className="font-display text-lg font-semibold">{o.project_title}</h2><p className="text-sm text-muted">{o.service_title}</p></div><StatusBadge value={o.status} /></div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-raised"><div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${o.progress}%` }} /></div>
              <p className="mt-2 text-xs text-muted">{o.stage} · {o.progress}% · submitted {fmtDate(o.created_at)}</p>
            </Link>))}
      </div>
    </>
  );
}
