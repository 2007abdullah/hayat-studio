import clsx from "clsx";

type Common = { label: string; error?: string; hint?: string; className?: string };
export function Input({ label, error, hint, className, id, ...rest }: Common & React.InputHTMLAttributes<HTMLInputElement>) {
  const fid = id || `f-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className={className}>
      <label htmlFor={fid} className="label">{label}{rest.required && <span className="text-accent"> *</span>}</label>
      <input id={fid} className={clsx("input", error && "border-red-500/60")} aria-invalid={!!error} aria-describedby={error ? `${fid}-e` : undefined} {...rest} />
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p id={`${fid}-e`} role="alert" className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
export function Textarea({ label, error, hint, className, id, ...rest }: Common & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fid = id || `f-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className={className}>
      <label htmlFor={fid} className="label">{label}{rest.required && <span className="text-accent"> *</span>}</label>
      <textarea id={fid} rows={5} className={clsx("input resize-y", error && "border-red-500/60")} aria-invalid={!!error} {...rest} />
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
export function Select({ label, error, className, id, children, ...rest }: Common & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const fid = id || `f-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className={className}>
      <label htmlFor={fid} className="label">{label}</label>
      <select id={fid} className={clsx("input appearance-none", error && "border-red-500/60")} {...rest}>{children}</select>
      {error && <p role="alert" className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
export function Check({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-raised/40 px-4 py-3 text-sm transition hover:border-accent/50 has-[:checked]:border-accent/70 has-[:checked]:bg-accent/10">
      <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" {...rest} />{label}
    </label>
  );
}
