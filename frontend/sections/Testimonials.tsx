"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { Testimonial } from "@/types";
import Reveal from "@/components/Reveal";

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 6500);
    return () => clearInterval(id);
  }, [paused, items.length]);
  if (!items.length) return null;
  const t = items[i % items.length];
  const go = (d: number) => setI((v) => (v + d + items.length) % items.length);
  return (
    <section className="container-x py-24" aria-labelledby="t-title" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Reveal><h2 id="t-title" className="h2">What clients say</h2></Reveal>
      <div className="card mt-10 min-h-[260px] p-8 sm:p-12" aria-live="polite">
        <Quote className="h-8 w-8 text-accent/60" aria-hidden />
        <AnimatePresence mode="wait">
          <motion.figure key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
            <blockquote className="mt-5 max-w-3xl font-display text-xl leading-snug sm:text-2xl">{t.quote}</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-line bg-raised font-display font-semibold text-accent">{t.name.charAt(0)}</span>
              <span className="text-sm"><b className="font-medium">{t.name}</b><br /><span className="text-muted">{t.role}{t.company && `, ${t.company}`}</span></span>
              {t.is_demo && <span className="badge ml-auto">Demo content</span>}
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      {items.length > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5">{items.map((x, k) => <button key={x.id} aria-label={`Show testimonial ${k + 1}`} onClick={() => setI(k)} className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-accent" : "w-3 bg-line"}`} />)}</div>
          <div className="flex gap-2"><button aria-label="Previous testimonial" onClick={() => go(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-line hover:border-accent/60"><ChevronLeft className="h-4 w-4" /></button><button aria-label="Next testimonial" onClick={() => go(1)} className="grid h-9 w-9 place-items-center rounded-full border border-line hover:border-accent/60"><ChevronRight className="h-4 w-4" /></button></div>
        </div>
      )}
    </section>
  );
}
