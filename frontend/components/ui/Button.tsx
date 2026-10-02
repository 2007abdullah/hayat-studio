import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Loader2 } from "lucide-react";

type Props = { variant?: "primary" | "ghost" | "outline" | "danger"; arrow?: boolean; loading?: boolean; href?: string; className?: string; size?: "sm" | "md" } &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export default function Button({ variant = "primary", arrow, loading, href, className, size = "md", children, disabled, ...rest }: Props) {
  const cls = clsx(
    "group inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60",
    size === "md" ? "px-6 py-3 text-sm" : "px-4 py-2 text-[13px]",
    variant === "primary" && "bg-accent text-bg shadow-[0_0_0_0_rgb(var(--accent)/0.5)] hover:shadow-[0_0_28px_0_rgb(var(--accent)/0.45)]",
    variant === "outline" && "border border-line bg-surface/60 text-fg hover:border-accent/60",
    variant === "ghost" && "text-muted hover:bg-raised hover:text-fg",
    variant === "danger" && "border border-red-500/40 text-red-400 hover:bg-red-500/10",
    className,
  );
  const inner = (<>{loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}{children}{arrow && !loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />}</>);
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <button className={cls} disabled={disabled || loading} {...rest}>{inner}</button>;
}
