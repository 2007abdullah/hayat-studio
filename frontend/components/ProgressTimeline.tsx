"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { STAGES } from "@/types";

export default function ProgressTimeline({ stage, cancelled }: { stage: string; cancelled?: boolean }) {
  const reduce = useReducedMotion();
  const idx = Math.max(0, STAGES.findIndex((s) => s === stage));
  if (cancelled) return <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">This order was cancelled.</p>;
  return (
    <ol className="grid gap-4 sm:grid-cols-7" aria-label="Project progress">
      {STAGES.map((s, i) => {
        const state = i < idx ? "done" : i === idx ? "current" : "todo";
        return (
          <li key={s} className="relative flex items-center gap-3 sm:flex-col sm:text-center" aria-current={state === "current" ? "step" : undefined}>
            {i > 0 && <motion.span aria-hidden initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: i <= idx ? 1 : 0 }} transition={{ delay: i * 0.12, duration: 0.4 }} className="absolute right-1/2 top-4 hidden h-px w-full origin-left bg-accent sm:block" style={{ zIndex: 0 }} />}
            <motion.span initial={reduce ? false : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs ${state === "done" ? "border-accent bg-accent text-bg" : state === "current" ? "border-accent bg-bg text-accent shadow-[0_0_18px_rgb(var(--accent)/0.5)]" : "border-line bg-bg text-muted"}`}>
              {state === "done" ? <Check className="h-4 w-4" /> : i + 1}
            </motion.span>
            <span className={`text-xs ${state === "todo" ? "text-muted" : "text-fg"}`}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}
