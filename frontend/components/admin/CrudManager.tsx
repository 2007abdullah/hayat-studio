"use client";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError, uploadFile } from "@/lib/api";
import Button from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/misc";

export type FieldSpec = { key: string; label: string; type: "text" | "textarea" | "number" | "bool" | "list" | "json" | "image"; required?: boolean; help?: string };
type Row = Record<string, any> & { id: number };

export default function CrudManager({ title, endpoint, fields, titleKey, subKey, defaults }: { title: string; endpoint: string; fields: FieldSpec[]; titleKey: string; subKey?: string; defaults: Record<string, any> }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(() => { api<Row[]>(`/admin/${endpoint}`).then(setRows).catch(() => setRows([])); }, [endpoint]);
  useEffect(load, [load]);

  function open(row: Row | null) {
    setEditing(row ?? ({ id: 0 } as Row)); setErrors({});
    const base = row ?? defaults;
    const f: Record<string, any> = {};
    for (const s of fields) { const v = base[s.key]; f[s.key] = s.type === "list" ? (v ?? []).join("\n") : s.type === "json" ? JSON.stringify(v ?? {}, null, 2) : v ?? (s.type === "bool" ? false : ""); }
    setForm(f);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, any> = {};
    try {
      for (const s of fields) {
        const v = form[s.key];
        body[s.key] = s.type === "list" ? String(v).split("\n").map((x) => x.trim()).filter(Boolean) : s.type === "json" ? JSON.parse(v || "{}") : s.type === "number" ? Number(v || 0) : v === "" && !s.required ? null : v;
      }
    } catch { toast.error("One of the JSON fields isn't valid JSON."); return; }
    // keep non-empty strings for text fields that default to ""
    for (const s of fields) if (s.type === "text" || s.type === "textarea" || s.type === "image") if (body[s.key] === null && !["live_url", "github_url"].includes(s.key)) body[s.key] = "";
    setBusy(true); setErrors({});
    try {
      if (editing?.id) await api(`/admin/${endpoint}/${editing.id}`, { method: "PUT", json: body }); else await api(`/admin/${endpoint}`, { method: "POST", json: body });
      toast.success("Saved"); setEditing(null); load();
    } catch (err) { if (err instanceof ApiError) { setErrors(err.fields); toast.error(err.message); } else toast.error("Couldn't save."); } finally { setBusy(false); }
  }

  async function remove(r: Row) {
    if (!confirm(`Delete "${r[titleKey]}"? This can't be undone.`)) return;
    try { await api(`/admin/${endpoint}/${r.id}`, { method: "DELETE" }); toast.success("Deleted"); load(); } catch { toast.error("Couldn't delete."); }
  }

  async function uploadImage(key: string, file?: File) {
    if (!file) return;
    try { const r = (await uploadFile("/admin/upload-image", file, () => {})) as { url: string }; setForm((f) => ({ ...f, [key]: r.url })); toast.success("Image uploaded"); }
    catch (err) { toast.error(err instanceof ApiError ? err.message : "Upload failed."); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="h2">{title}</h1><Button onClick={() => open(null)} size="sm"><Plus className="h-4 w-4" /> Add new</Button></div>
      {editing && (
        <form onSubmit={save} className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="font-display font-semibold sm:col-span-2">{editing.id ? "Edit" : "Create"}</h2>
          {fields.map((s) => {
            const id = `crud-${s.key}`; const wide = ["textarea", "list", "json", "image"].includes(s.type) ? "sm:col-span-2" : "";
            return (
              <div key={s.key} className={wide}>
                {s.type === "bool" ? <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={!!form[s.key]} onChange={(e) => setForm({ ...form, [s.key]: e.target.checked })} />{s.label}</label> : (<>
                  <label htmlFor={id} className="label">{s.label}{s.required && <span className="text-accent"> *</span>}</label>
                  {s.type === "textarea" || s.type === "list" || s.type === "json" ? <textarea id={id} rows={s.type === "json" ? 8 : 4} className={`input ${s.type === "json" ? "font-mono text-xs" : ""}`} value={form[s.key] ?? ""} onChange={(e) => setForm({ ...form, [s.key]: e.target.value })} required={s.required} />
                    : <input id={id} type={s.type === "number" ? "number" : "text"} className="input" value={form[s.key] ?? ""} onChange={(e) => setForm({ ...form, [s.key]: e.target.value })} required={s.required} />}
                  {s.type === "image" && <input type="file" accept="image/png,image/jpeg,image/webp" aria-label={`Upload ${s.label}`} className="mt-2 text-xs text-muted" onChange={(e) => uploadImage(s.key, e.target.files?.[0])} />}
                  {s.type === "list" && <p className="mt-1 text-xs text-muted">One per line</p>}
                  {s.help && <p className="mt-1 text-xs text-muted">{s.help}</p>}
                </>)}
                {errors[s.key] && <p role="alert" className="mt-1 text-xs text-red-400">{errors[s.key]}</p>}
              </div>
            );
          })}
          <div className="flex gap-2 sm:col-span-2"><Button type="submit" loading={busy}>Save changes</Button><Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
        </form>
      )}
      {rows === null ? <Skeleton className="h-40" /> : rows.length === 0 ? <EmptyState title={`No ${title.toLowerCase()} yet`} /> : (
        <ul className="space-y-2">{rows.map((r) => (
          <li key={r.id} className="card flex items-center justify-between gap-3 px-5 py-3"><div className="min-w-0"><p className="truncate font-medium">{r[titleKey]}</p>{subKey && <p className="truncate text-xs text-muted">{String(r[subKey] ?? "")}</p>}</div>
            <div className="flex shrink-0 gap-1"><button aria-label={`Edit ${r[titleKey]}`} onClick={() => open(r)} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-raised hover:text-fg"><Pencil className="h-4 w-4" /></button><button aria-label={`Delete ${r[titleKey]}`} onClick={() => remove(r)} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div></li>))}</ul>)}
    </div>
  );
}
