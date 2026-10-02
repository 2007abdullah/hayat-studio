"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError, fmtDate, fmtTime } from "@/lib/api";
import OrderThread from "@/components/OrderThread";
import ProgressTimeline from "@/components/ProgressTimeline";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/misc";
import { PRIORITIES, STATUSES, type Order } from "@/types";

export default function AdminOrder({ params }: { params: { id: string } }) {
  const [o, setO] = useState<Order | null>(null);
  const [busy, setBusy] = useState("");
  const load = useCallback(() => { api<Order>(`/orders/${params.id}`).then(setO).catch(() => toast.error("Order not found.")); }, [params.id]);
  useEffect(load, [load]);
  if (!o) return <Skeleton className="h-72" />;

  async function patch(data: Record<string, unknown>, ok: string) {
    try { await api(`/orders/${params.id}`, { method: "PATCH", json: data }); toast.success(ok); load(); } catch (e) { toast.error(e instanceof ApiError ? e.message : "Update failed."); }
  }
  async function post(kind: "updates" | "notes", e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const d = Object.fromEntries(new FormData(form)) as Record<string, any>;
    if (d.progress === "" ) delete d.progress; else if (d.progress !== undefined) d.progress = Number(d.progress);
    setBusy(kind);
    try { await api(`/orders/${params.id}/${kind}`, { method: "POST", json: d }); toast.success(kind === "updates" ? "Update posted" : "Note saved"); form.reset(); load(); }
    catch (err) { toast.error(err instanceof ApiError ? err.message : "Couldn't save."); } finally { setBusy(""); }
  }
  const details = Object.entries(o.details || {}).filter(([, v]) => v !== false && v !== null && v !== "");

  return (
    <div className="space-y-8">
      <div><Link href="/admin/orders" className="text-sm text-muted hover:text-fg">← All orders</Link>
        <h1 className="h2 mt-3">{o.project_title}</h1>
        <p className="text-sm text-muted"><span className="font-mono">{o.order_number}</span> · {o.service_title} · {fmtDate(o.created_at)}</p></div>
      <div className="card p-6"><ProgressTimeline stage={o.stage} cancelled={o.status === "Cancelled"} /></div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="card space-y-4 p-6" aria-label="Order details">
          <h2 className="font-display font-semibold">Client</h2>
          <p className="text-sm">{o.client_name}{o.company && ` · ${o.company}`}{o.country && ` · ${o.country}`}<br /><a className="text-accent" href={`mailto:${o.client_email}?subject=${encodeURIComponent(`Re: ${o.order_number}`)}`}><Mail className="mr-1 inline h-3.5 w-3.5" />{o.client_email}</a>{o.client_phone && <><br />{o.client_phone}</>}</p>
          <dl className="grid grid-cols-2 gap-2 text-sm"><dt className="text-muted">Budget</dt><dd>{o.budget || "-"}</dd><dt className="text-muted">Deadline</dt><dd>{o.deadline || "-"}</dd><dt className="text-muted">Type</dt><dd>{o.project_type || "-"}</dd></dl>
          <div><h3 className="text-sm font-medium">Requirements</h3><p className="mt-1 whitespace-pre-wrap text-sm text-muted">{o.requirements}</p></div>
          {details.length > 0 && <ul className="flex flex-wrap gap-1.5">{details.map(([k, v]) => <li key={k} className="badge">{k.replace(/_/g, " ")}{typeof v === "string" ? `: ${v}` : ""}</li>)}</ul>}
        </section>
        <section className="card space-y-4 p-6" aria-label="Manage order">
          <h2 className="font-display font-semibold">Manage</h2>
          <Select label="Status" value={o.status} onChange={(e) => patch({ status: e.target.value }, "Status updated")}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</Select>
          <Select label="Priority" value={o.priority} onChange={(e) => patch({ priority: e.target.value }, "Priority updated")}>{PRIORITIES.map((s) => <option key={s}>{s}</option>)}</Select>
          <form onSubmit={(e) => { e.preventDefault(); const v = new FormData(e.currentTarget).get("quote") as string; patch({ quoted_amount: v ? Number(v) : null }, "Quote saved"); }} className="flex items-end gap-2"><Input label="Quoted amount (USD)" name="quote" type="number" min={0} defaultValue={o.quoted_amount ?? ""} className="flex-1" /><Button type="submit" variant="outline" size="sm">Save</Button></form>
        </section>
      </div>
      <OrderThread orderId={o.id} me="admin" files={o.files ?? []} updates={o.updates ?? []} onChanged={load} />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={(e) => post("updates", e)} className="card space-y-4 p-6"><h2 className="font-display font-semibold">Post a project update (visible to client)</h2>
          <Input label="Title" name="title" required /><Textarea label="Details" name="body" required rows={3} /><Input label="Progress % (optional)" name="progress" type="number" min={0} max={100} /><Button type="submit" loading={busy === "updates"}>Post update</Button></form>
        <div className="card space-y-4 p-6"><h2 className="font-display font-semibold">Private notes</h2>
          <form onSubmit={(e) => post("notes", e)} className="space-y-3"><Textarea label="Add a note (only you can see this)" name="body" required rows={3} /><Button type="submit" variant="outline" loading={busy === "notes"}>Save note</Button></form>
          <ul className="space-y-2">{(o.notes ?? []).map((n) => <li key={n.id} className="rounded-lg border border-line p-3 text-sm"><p className="whitespace-pre-wrap">{n.body}</p><p className="mt-1 text-xs text-muted">{fmtTime(n.created_at)}</p></li>)}</ul></div>
      </div>
    </div>
  );
}
