"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Paperclip, Send } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError, fmtSize, fmtTime, uploadFile } from "@/lib/api";
import type { FileRec, Msg, Upd } from "@/types";
import Button from "./ui/Button";
import { EmptyState } from "./ui/misc";

type Props = { orderId: number; me: "client" | "admin"; files: FileRec[]; updates: Upd[]; onChanged: () => void };

export default function OrderThread({ orderId, me, files, updates, onChanged }: Props) {
  const [msgs, setMsgs] = useState<Msg[] | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try { setMsgs(await api<Msg[]>(`/orders/${orderId}/messages`)); } catch { /* keep previous */ }
  }, [orderId]);
  useEffect(() => { load(); const id = setInterval(load, 15000); return () => clearInterval(id); }, [load]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [msgs?.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try { await api(`/orders/${orderId}/messages`, { method: "POST", json: { body } }); setBody(""); toast.success("Message sent"); await load(); }
    catch (err) { toast.error(err instanceof ApiError ? err.message : "Message not sent."); } finally { setBusy(false); }
  }
  async function upload(f: File | undefined) {
    if (!f) return;
    setPct(0);
    try { await uploadFile(`/orders/${orderId}/files`, f, setPct); toast.success("File uploaded"); onChanged(); }
    catch (err) { toast.error(err instanceof ApiError ? err.message : "Upload failed."); } finally { setPct(null); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="card flex h-[520px] flex-col" aria-label="Messages">
        <h2 className="border-b border-line px-5 py-3 font-display font-semibold">Messages</h2>
        <div className="flex-1 space-y-3 overflow-y-auto p-5" role="log" aria-live="polite">
          {msgs === null ? <div className="skeleton h-16" /> : msgs.length === 0 ? <p className="py-10 text-center text-sm text-muted">No messages yet. Say hello below.</p> :
            msgs.map((m) => {
              const mine = m.sender_role === me;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${mine ? "rounded-br-sm bg-accent text-bg" : "rounded-bl-sm bg-raised"}`}>
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p className={`mt-1 text-[11px] ${mine ? "text-bg/70" : "text-muted"}`}>{m.sender_role === "admin" ? "Abdullah" : "Client"} · {fmtTime(m.created_at)}{mine && (m.is_read ? " · Read" : " · Sent")}</p>
                  </div>
                </div>
              );
            })}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
          <label htmlFor="msg" className="sr-only">Message</label>
          <input id="msg" value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} placeholder="Write a message" className="input" />
          <Button type="submit" loading={busy} aria-label="Send message" className="px-4"><Send className="h-4 w-4" /></Button>
        </form>
      </section>
      <div className="space-y-6">
        <section className="card p-5" aria-label="Files">
          <div className="flex items-center justify-between"><h2 className="font-display font-semibold">Files</h2>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs hover:border-accent/60"><Paperclip className="h-3.5 w-3.5" /> Upload
              <input type="file" className="sr-only" accept=".pdf,.png,.jpg,.jpeg,.docx,.zip" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} /></label></div>
          {pct !== null && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-raised" role="progressbar" aria-valuenow={pct}><div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} /></div>}
          <ul className="mt-3 space-y-2">{files.length === 0 ? <li className="text-sm text-muted">No files yet.</li> : files.map((f) => (
            <li key={f.id}><a href={`/api/files/${f.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-sm hover:border-accent/60"><span className="truncate">{f.filename}</span><span className="flex shrink-0 items-center gap-2 text-xs text-muted">{fmtSize(f.size)} <Download className="h-3.5 w-3.5" /></span></a></li>))}</ul>
        </section>
        <section className="card p-5" aria-label="Project updates">
          <h2 className="font-display font-semibold">Project updates</h2>
          {updates.length === 0 ? <p className="mt-3 text-sm text-muted">Updates will appear here as work progresses.</p> :
            <ol className="mt-4 space-y-4 border-l border-line pl-4">{updates.map((u) => <li key={u.id} className="relative"><span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-accent" aria-hidden /><p className="text-sm font-medium">{u.title}{u.progress !== null && <span className="ml-2 text-xs text-accent">{u.progress}%</span>}</p><p className="text-sm text-muted">{u.body}</p><p className="mt-0.5 text-xs text-muted">{fmtTime(u.created_at)}</p></li>)}</ol>}
        </section>
      </div>
    </div>
  );
}
