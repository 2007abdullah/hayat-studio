"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Cloud, Database, GitBranch, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";

const lines = [
  { t: "$ git push origin main", c: "text-fg" },
  { t: "✓ lint · tests · build passed", c: "text-emerald-300" },
  { t: "$ docker build -t api:latest .", c: "text-fg" },
  { t: "→ deploying to production…", c: "text-warm" },
  { t: "POST /api/orders  201 Created", c: "text-accent" },
  { t: "✓ live · ssl · monitoring on", c: "text-emerald-300" },
];

function Terminal() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? lines.length : 0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setN((v) => (v >= lines.length + 3 ? 0 : v + 1)), 950);
    return () => clearInterval(id);
  }, [reduce]);
  return (
    <div className="glass w-full max-w-md rounded-2xl p-5 font-mono text-[13px] shadow-2xl shadow-black/30" aria-label="Animated terminal showing a deployment">
      <div className="mb-4 flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-red-400/80" /><i className="h-2.5 w-2.5 rounded-full bg-amber-300/80" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" /><span className="ml-3 text-xs text-muted">deploy.sh</span></div>
      <div className="min-h-[168px] space-y-2">
        {lines.slice(0, n).map((l, i) => <motion.p key={`${i}-${l.t}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={l.c}>{l.t}</motion.p>)}
        <span className="inline-block h-4 w-2 animate-blink bg-accent align-middle" aria-hidden />
      </div>
    </div>
  );
}

const float = [
  { Icon: GitBranch, label: "CI/CD", cls: "left-0 top-6", depth: 18 },
  { Icon: Database, label: "PostgreSQL", cls: "right-2 top-28", depth: -22 },
  { Icon: Cloud, label: "Cloud", cls: "left-6 bottom-6", depth: -14 },
  { Icon: ShieldCheck, label: "Secure auth", cls: "right-0 bottom-0", depth: 24 },
];

export default function Hero() {
  const reduce = useReducedMotion();
  const mx = useSpring(useMotionValue(0), { stiffness: 80, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 80, damping: 18 });
  const onMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const words = ["BUILD.", "DEPLOY.", "SCALE."];
  return (
    <section onMouseMove={onMove} className="relative isolate overflow-hidden pb-20 pt-32 sm:pt-40" aria-labelledby="hero-title">
      <div className="grid-bg absolute inset-0 -z-10 animate-gridmove" aria-hidden />
      <div className="absolute -top-40 left-1/2 -z-10 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" aria-hidden />
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.p initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="badge mb-6 gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Available for new projects</motion.p>
          <h1 id="hero-title" className="h1 text-[2.6rem] sm:text-6xl lg:text-7xl">
            {words.map((w, i) => (
              <motion.span key={w} className="mr-3 inline-block" initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7, delay: 0.1 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}>{w}</motion.span>
            ))}
          </h1>
          <motion.p initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }} className="lead mt-6">
            Full-Stack Developer &amp; DevOps Engineer building high-performance web applications, scalable APIs, cloud infrastructure, and AI-powered solutions.
          </motion.p>
          <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }} className="mt-9 flex flex-wrap gap-3">
            <Button href="/order" arrow>Start a Project</Button>
            <Button href="/projects" variant="outline">Explore My Work</Button>
          </motion.div>
        </div>
        <div className="relative mx-auto flex min-h-[340px] w-full max-w-md items-center justify-center lg:max-w-none">
          <Terminal />
          {float.map(({ Icon, label, cls, depth }, i) => <FloatCard key={label} Icon={Icon} label={label} cls={cls} depth={depth} mx={mx} my={my} i={i} />)}
        </div>
      </div>
    </section>
  );
}

function FloatCard({ Icon, label, cls, depth, mx, my, i }: any) {
  const x = useTransform(mx, (v: number) => v * depth * 2);
  const y = useTransform(my, (v: number) => v * depth * 2);
  return (
    <motion.div style={{ x, y }} className={`absolute ${cls} hidden sm:block`}>
      <div className="glass flex animate-float items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm" style={{ animationDelay: `${i * 0.8}s` }}><Icon className="h-4 w-4 text-accent" />{label}</div>
    </motion.div>
  );
}
