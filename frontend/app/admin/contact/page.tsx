"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, fmtTime } from "@/lib/api";
import Button from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/misc";

type M = { id: number; name: string; email: string; subject: string; message: string; is_handled: boolean; created_at: string };

export default function Inquiries() {
  const [rows, setRows] = useState<M[] | null>(null);
  const load = useCallback(() => { api<M[]>("/admin/contact-messages").then(setRows).catch(() => setRows([])); }, []);
  useEffect(load, [load]);
  return (
    <div className="space-y-6"><h1 className="h2">Inquiries</h1>
      {rows === null ? <Skeleton className="h-40" /> : rows.length === 0 ? <EmptyState title="No messages yet" text="Contact form submissions appear here." /> : (
        <ul className="space-y-3">{rows.map((m) => (
          <li key={m.id} className="card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-medium">{m.subject}</p><p className="text-sm text-muted">{m.name} · <a className="text-accent" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}>{m.email}</a> · {fmtTime(m.created_at)}</p></div>
            {m.is_handled ? <span className="badge">Handled</span> : <Button size="sm" variant="outline" onClick={async () => { await api(`/admin/contact-messages/${m.id}`, { method: "PATCH" }); toast.success("Marked as handled"); load(); }}>Mark handled</Button>}</div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{m.message}</p></li>))}</ul>)}
    </div>
  );
}
