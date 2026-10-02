"use client";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function CaseStudyNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });
  useEffect(() => {
    const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-30% 0px -60% 0px" });
    items.forEach((i) => { const el = document.getElementById(i.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [items]);
  return (
    <nav aria-label="Case study sections" className="sticky top-24 hidden h-fit lg:block">
      <div className="relative border-l border-line pl-4">
        <motion.span style={{ scaleY }} className="absolute -left-px top-0 h-full w-px origin-top bg-accent" aria-hidden />
        <ul className="space-y-2.5 text-sm">{items.map((i) => <li key={i.id}><a href={`#${i.id}`} className={active === i.id ? "text-fg" : "text-muted hover:text-fg"}>{i.label}</a></li>)}</ul>
      </div>
    </nav>
  );
}
