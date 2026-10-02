import clsx from "clsx";

export const Skeleton = ({ className }: { className?: string }) => <div className={clsx("skeleton", className)} aria-hidden />;

const tone: Record<string, string> = {
  New: "text-accent border-accent/40 bg-accent/10", Contacted: "text-sky-300 border-sky-400/30 bg-sky-400/10",
  Discussion: "text-violet-300 border-violet-400/30 bg-violet-400/10", "Quote Sent": "text-warm border-warm/40 bg-warm/10",
  "Payment Pending": "text-warm border-warm/40 bg-warm/10", "In Progress": "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  Review: "text-fuchsia-300 border-fuchsia-400/30 bg-fuchsia-400/10", Completed: "text-emerald-300 border-emerald-400/40 bg-emerald-400/15",
  Cancelled: "text-red-300 border-red-400/30 bg-red-400/10", Low: "text-muted border-line bg-raised", Medium: "text-sky-300 border-sky-400/30 bg-sky-400/10",
  High: "text-warm border-warm/40 bg-warm/10", Urgent: "text-red-300 border-red-400/40 bg-red-400/10",
};
export const StatusBadge = ({ value }: { value: string }) => (
  <span className={clsx("inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium", tone[value] || tone.Low)}>{value}</span>
);

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
      <p className="font-display text-lg font-medium">{title}</p>
      {text && <p className="max-w-md text-sm text-muted">{text}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
