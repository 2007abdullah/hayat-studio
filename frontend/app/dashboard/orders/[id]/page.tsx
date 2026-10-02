"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, fmtDate } from "@/lib/api";
import OrderThread from "@/components/OrderThread";
import ProgressTimeline from "@/components/ProgressTimeline";
import { Skeleton, StatusBadge } from "@/components/ui/misc";
import type { Order } from "@/types";

export default function ClientOrder({ params }: { params: { id: string } }) {
  const [o, setO] = useState<Order | null>(null);
  const [missing, setMissing] = useState(false);
  const load = useCallback(() => { api<Order>(`/orders/${params.id}`).then(setO).catch(() => setMissing(true)); }, [params.id]);
  useEffect(load, [load]);
  if (missing) return <p className="text-muted">Order not found. <Link href="/dashboard" className="text-accent">Back to your projects</Link></p>;
  if (!o) return <Skeleton className="h-64" />;
  return (
    <div className="space-y-8">
      <div><Link href="/dashboard" className="text-sm text-muted hover:text-fg">← All projects</Link>
        <div className="mt-3 flex flex-wrap items-center gap-3"><h1 className="h2">{o.project_title}</h1><StatusBadge value={o.status} /></div>
        <p className="mt-1 text-sm text-muted"><span className="font-mono">{o.order_number}</span> · {o.service_title} · submitted {fmtDate(o.created_at)}{o.quoted_amount ? ` · quote $${o.quoted_amount.toLocaleString()}` : ""}</p></div>
      <div className="card p-6"><ProgressTimeline stage={o.stage} cancelled={o.status === "Cancelled"} /></div>
      <OrderThread orderId={o.id} me="client" files={o.files ?? []} updates={o.updates ?? []} onChanged={load} />
      <details className="card p-5 text-sm"><summary className="cursor-pointer font-medium">Original request</summary><p className="mt-3 whitespace-pre-wrap text-muted">{o.requirements}</p></details>
    </div>
  );
}
