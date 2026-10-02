"use client";
import { useEffect, useRef, useState } from "react";

/** Desktop-only cursor: dot -> ring on interactive elements -> "VIEW" over [data-cursor="view"]. */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"dot" | "ring" | "view">("dot");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;
    setEnabled(true);
    const move = (e: MouseEvent) => {
      if (ref.current) ref.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const t = e.target as HTMLElement | null;
      if (t?.closest("[data-cursor='view']")) setMode("view");
      else if (t?.closest("a, button, input, textarea, select, label, [role='button']")) setMode("ring");
      else setMode("dot");
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  if (!enabled) return null;
  const size = mode === "dot" ? 8 : mode === "ring" ? 40 : 76;
  return (
    <div ref={ref} aria-hidden className="cursor-dot pointer-events-none fixed left-0 top-0 z-[100] will-change-transform">
      <div style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
        className={`flex items-center justify-center rounded-full text-[11px] font-semibold tracking-wide transition-all duration-200 ease-out ${mode === "dot" ? "bg-accent" : mode === "ring" ? "border border-accent bg-accent/10" : "bg-accent text-bg"}`}>
        {mode === "view" ? "VIEW" : null}
      </div>
    </div>
  );
}
