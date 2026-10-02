"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, FileUp, X } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError, fmtDate, fmtSize, uploadFile } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Check, Input, Select, Textarea } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import type { Service } from "@/types";

const EXT = ["pdf", "png", "jpg", "jpeg", "docx", "zip"];
const MAX_MB = 15;
const budgets = ["Under $500", "$500 - $1,500", "$1,500 - $5,000", "$5,000 - $10,000", "$10,000+", "Not sure yet"];
const types = ["New project", "Redesign / rebuild", "Add features", "Deployment / DevOps", "AI integration", "Maintenance"];
const planService: Record<string, string> = { starter: "business-website-development", professional: "full-stack-web-development", premium: "saas-application-development" };

type Done = { order_number: string; service: string; status: string; submitted_at: string };

export default function OrderForm() {
  const params = useSearchParams();
  const { user, refresh } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [service, setService] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [createAccount, setCreateAccount] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<Service[]>("/services").then((s) => {
      setServices(s);
      const wanted = params.get("service") || planService[params.get("plan") || ""] || "";
      setService(s.some((x) => x.slug === wanted) ? wanted : "");
    }).catch(() => toast.error("Couldn't load services. Refresh the page."));
  }, [params]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      if (!EXT.includes(ext)) { toast.error(`${f.name}: only PDF, PNG, JPG, DOCX or ZIP files are allowed.`); continue; }
      if (f.size > MAX_MB * 1048576) { toast.error(`${f.name} is larger than ${MAX_MB} MB.`); continue; }
      next.push(f);
    }
    setFiles(next.slice(0, 8));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => (fd.get(k) as string) || undefined;
    const b = (k: string) => fd.get(k) === "on";
    const payload = {
      client_name: v("client_name"), client_email: v("client_email"), client_phone: v("client_phone"), company: v("company"), country: v("country"),
      service_slug: service, project_title: v("project_title"), project_type: v("project_type"), budget: v("budget"), deadline: v("deadline"),
      requirements: v("requirements"), required_features: v("required_features"), existing_website: v("existing_website"),
      existing_design: b("existing_design"), has_domain: b("has_domain"), has_hosting: b("has_hosting"), needs_database: b("needs_database"),
      needs_auth: b("needs_auth"), needs_admin: b("needs_admin"), needs_ai: b("needs_ai"),
      password: !user && createAccount ? v("password") : undefined,
    };
    setBusy(true); setErrors({});
    try {
      const res = await api<Done & { id: number; upload_token: string }>("/orders", { method: "POST", json: payload });
      let failed = 0;
      for (const f of files) {
        try { await uploadFile(`/orders/${res.id}/files`, f, (p) => setProgress((s) => ({ ...s, [f.name]: p })), { "X-Upload-Token": res.upload_token }); }
        catch (err) { failed++; toast.error(`${f.name}: ${err instanceof ApiError ? err.message : "upload failed"}`); }
      }
      if (createAccount) refresh();
      setDone(res);
      toast.success("Order submitted");
      if (failed) toast.message("Some files didn't upload. You can send them from your dashboard or reply by email.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiError) { setErrors(err.fields); toast.error(err.message); } else toast.error("Couldn't submit your order. Try again.");
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div className="card mx-auto mt-10 max-w-xl p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" aria-hidden />
        <h2 className="h2 mt-4 text-2xl">Your project request has been received successfully.</h2>
        <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-y-2 text-left text-sm">
          <dt className="text-muted">Order number</dt><dd className="font-mono font-medium">{done.order_number}</dd>
          <dt className="text-muted">Service</dt><dd>{done.service}</dd>
          <dt className="text-muted">Submitted</dt><dd>{fmtDate(done.submitted_at)}</dd>
          <dt className="text-muted">Status</dt><dd>{done.status}</dd>
        </dl>
        <p className="mt-5 text-sm text-muted">A confirmation email is on its way.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">{(user || createAccount) ? <Button href="/dashboard">Open dashboard</Button> : <Button href="/register" variant="outline">Create an account to track it</Button>}<Button href="/" variant="ghost">Back home</Button></div>
      </div>
    );
  }

  const e = errors;
  return (
    <form onSubmit={submit} className="mt-10 space-y-8" noValidate>
      <fieldset className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-8"><legend className="sr-only">Personal information</legend>
        <h2 className="font-display text-lg font-semibold sm:col-span-2">About you</h2>
        <Input label="Full name" name="client_name" required defaultValue={user?.full_name} autoComplete="name" error={e.client_name} />
        <Input label="Email" name="client_email" type="email" required defaultValue={user?.email} autoComplete="email" error={e.client_email} />
        <Input label="Phone" name="client_phone" type="tel" defaultValue={user?.phone ?? ""} autoComplete="tel" error={e.client_phone} />
        <Input label="Company" name="company" defaultValue={user?.company ?? ""} autoComplete="organization" />
        <Input label="Country" name="country" defaultValue={user?.country ?? ""} autoComplete="country-name" />
      </fieldset>
      <fieldset className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-8"><legend className="sr-only">Project information</legend>
        <h2 className="font-display text-lg font-semibold sm:col-span-2">Your project</h2>
        <Select label="Service" name="service" required value={service} onChange={(ev) => setService(ev.target.value)} error={e.service_slug}>
          <option value="">Choose a service</option>{services.map((s) => <option key={s.id} value={s.slug}>{s.title}</option>)}
        </Select>
        <Input label="Project title" name="project_title" required error={e.project_title} />
        <Select label="Project type" name="project_type"><option value="">Select</option>{types.map((t) => <option key={t}>{t}</option>)}</Select>
        <Select label="Budget" name="budget"><option value="">Select</option>{budgets.map((t) => <option key={t}>{t}</option>)}</Select>
        <Input label="Desired deadline" name="deadline" type="date" className="sm:col-span-2" />
      </fieldset>
      <fieldset className="card space-y-4 p-6 sm:p-8"><legend className="sr-only">Requirements</legend>
        <h2 className="font-display text-lg font-semibold">Requirements</h2>
        <Textarea label="Describe your project and requirements" name="requirements" required rows={7} hint="At least 20 characters. Goals, users, key flows, anything that matters." error={e.requirements} />
        <Textarea label="Required features" name="required_features" rows={3} />
        <Input label="Existing website (URL)" name="existing_website" type="url" placeholder="https://" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Check label="I have an existing design" name="existing_design" /><Check label="I have a domain" name="has_domain" /><Check label="I have hosting" name="has_hosting" />
          <Check label="Needs a database" name="needs_database" /><Check label="Needs authentication" name="needs_auth" /><Check label="Needs an admin dashboard" name="needs_admin" /><Check label="Needs AI integration" name="needs_ai" />
        </div>
      </fieldset>
      <fieldset className="card p-6 sm:p-8"><legend className="sr-only">File upload</legend>
        <h2 className="font-display text-lg font-semibold">Files (optional)</h2>
        <p className="mt-1 text-sm text-muted">PDF, PNG, JPG, DOCX or ZIP. Up to {MAX_MB} MB each, 8 files.</p>
        <input ref={fileRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.docx,.zip" className="sr-only" id="files" onChange={(ev) => { addFiles(ev.target.files); ev.target.value = ""; }} />
        <label htmlFor="files" className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-raised/40 px-4 py-8 text-sm text-muted transition hover:border-accent/60 hover:text-fg"><FileUp className="h-5 w-5" /> Choose files</label>
        {files.length > 0 && (
          <ul className="mt-4 space-y-2">{files.map((f) => (
            <li key={f.name + f.size} className="rounded-xl border border-line px-4 py-2.5 text-sm">
              <div className="flex items-center justify-between gap-3"><span className="truncate">{f.name} <span className="text-muted">({fmtSize(f.size)})</span></span>
                {!busy && <button type="button" onClick={() => setFiles(files.filter((x) => x !== f))} aria-label={`Remove ${f.name}`} className="text-muted hover:text-fg"><X className="h-4 w-4" /></button>}</div>
              {progress[f.name] !== undefined && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-raised" role="progressbar" aria-valuenow={progress[f.name]} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-accent transition-all" style={{ width: `${progress[f.name]}%` }} /></div>}
            </li>))}</ul>
        )}
      </fieldset>
      {!user && (
        <div className="card space-y-4 p-6 sm:p-8">
          <Check label="Create an account so I can track this project and message you" checked={createAccount} onChange={(ev) => setCreateAccount(ev.target.checked)} />
          {createAccount && <Input label="Password" name="password" type="password" minLength={8} required autoComplete="new-password" hint="At least 8 characters. Use the same email as above." error={e.password} />}
        </div>
      )}
      <Button type="submit" loading={busy} arrow>{busy ? "Submitting" : "Submit project request"}</Button>
    </form>
  );
}
