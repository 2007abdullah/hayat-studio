"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import CrudManager from "@/components/admin/CrudManager";
import Button from "@/components/ui/Button";

type Stat = { label: string; value: string };

export default function Content() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api<{ items: Stat[] }>("/stats").then((r) => setStats(r.items)).catch(() => {}); }, []);
  async function save() {
    setBusy(true);
    try { await api("/admin/stats", { method: "PUT", json: { items: stats.filter((s) => s.label && s.value) } }); toast.success("Statistics saved"); }
    catch (e) { toast.error(e instanceof ApiError ? e.message : "Couldn't save."); } finally { setBusy(false); }
  }
  return (
    <div className="space-y-12">
      <section className="space-y-4"><h1 className="h2">About statistics</h1><p className="text-sm text-muted">Shown in the About section. The defaults are placeholders: edit them to match reality.</p>
        <div className="card space-y-3 p-6">
          {stats.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input aria-label="Label" className="input" value={s.label} onChange={(e) => setStats(stats.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} />
              <input aria-label="Value" className="input" value={s.value} onChange={(e) => setStats(stats.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)))} />
              <Button variant="danger" size="sm" onClick={() => setStats(stats.filter((_, k) => k !== i))} aria-label="Remove statistic">Remove</Button>
            </div>))}
          <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setStats([...stats, { label: "", value: "" }])}>Add statistic</Button><Button size="sm" loading={busy} onClick={save}>Save statistics</Button></div>
        </div></section>
      <CrudManager title="Testimonials" endpoint="testimonials" titleKey="name" subKey="company" defaults={{ is_demo: false, is_published: true }}
        fields={[{ key: "name", label: "Client name", type: "text", required: true }, { key: "company", label: "Company", type: "text" }, { key: "role", label: "Role", type: "text" },
          { key: "quote", label: "Testimonial", type: "textarea", required: true }, { key: "is_demo", label: "Demo content (shows a Demo badge)", type: "bool" }, { key: "is_published", label: "Published", type: "bool" }]} />
    </div>
  );
}
