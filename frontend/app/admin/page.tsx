"use client";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { EmptyState, Skeleton } from "@/components/ui/misc";

type A = { total_orders: number; new_orders: number; active_projects: number; completed_projects: number; total_clients: number; revenue_estimate: number; pending_inquiries: number; conversion_rate: number;
  orders_by_service: { service: string; count: number }[]; orders_over_time: { month: string; count: number }[]; orders_by_status: Record<string, number> };

const tip = { contentStyle: { background: "rgb(var(--surface))", border: "1px solid rgb(var(--line))", borderRadius: 12, fontSize: 12 } };

export default function Overview() {
  const [a, setA] = useState<A | null>(null);
  useEffect(() => { api<A>("/admin/analytics").then(setA); }, []);
  if (!a) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
  const cards = [["Total orders", a.total_orders], ["New orders", a.new_orders], ["Active projects", a.active_projects], ["Completed projects", a.completed_projects],
    ["Total clients", a.total_clients], ["Revenue estimate", `$${a.revenue_estimate.toLocaleString()}`], ["Pending inquiries", a.pending_inquiries], ["Inquiry conversion", `${a.conversion_rate}%`]];
  const statusData = Object.entries(a.orders_by_status).map(([status, count]) => ({ status, count }));
  return (
    <div className="space-y-8">
      <h1 className="h2">Overview</h1>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([k, v]) => <div key={k as string} className="card p-5"><dd className="font-display text-3xl font-semibold">{v}</dd><dt className="mt-1 text-sm text-muted">{k}</dt></div>)}</dl>
      <p className="text-xs text-muted">Revenue estimate sums the quoted amounts of orders that are In Progress, in Review or Completed.</p>
      {a.total_orders === 0 ? <EmptyState title="No orders yet" text="Charts appear once your first order arrives." /> : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-5"><h2 className="mb-4 font-display font-semibold">Orders over time</h2><div className="h-64"><ResponsiveContainer><LineChart data={a.orders_over_time}><CartesianGrid stroke="rgb(var(--line))" vertical={false} /><XAxis dataKey="month" stroke="rgb(var(--muted))" fontSize={12} /><YAxis allowDecimals={false} stroke="rgb(var(--muted))" fontSize={12} /><Tooltip {...tip} /><Line dataKey="count" stroke="rgb(var(--accent))" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div></div>
          <div className="card p-5"><h2 className="mb-4 font-display font-semibold">Orders by service</h2><div className="h-64"><ResponsiveContainer><BarChart data={a.orders_by_service} layout="vertical" margin={{ left: 20 }}><CartesianGrid stroke="rgb(var(--line))" horizontal={false} /><XAxis type="number" allowDecimals={false} stroke="rgb(var(--muted))" fontSize={12} /><YAxis type="category" dataKey="service" width={130} stroke="rgb(var(--muted))" fontSize={11} /><Tooltip {...tip} /><Bar dataKey="count" radius={6} fill="rgb(var(--accent))" /></BarChart></ResponsiveContainer></div></div>
          <div className="card p-5 lg:col-span-2"><h2 className="mb-4 font-display font-semibold">Orders by status</h2><div className="h-56"><ResponsiveContainer><BarChart data={statusData}><CartesianGrid stroke="rgb(var(--line))" vertical={false} /><XAxis dataKey="status" stroke="rgb(var(--muted))" fontSize={11} /><YAxis allowDecimals={false} stroke="rgb(var(--muted))" fontSize={12} /><Tooltip {...tip} /><Bar dataKey="count" radius={6}>{statusData.map((d) => <Cell key={d.status} fill={d.status === "Completed" ? "#34d399" : d.status === "Cancelled" ? "#f87171" : "rgb(var(--accent))"} />)}</Bar></BarChart></ResponsiveContainer></div></div>
        </div>
      )}
    </div>
  );
}
