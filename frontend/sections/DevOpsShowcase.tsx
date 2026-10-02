"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, Boxes, CheckCircle2, CloudCog, Code2, GitBranch, Github, Rocket, Workflow } from "lucide-react";
import Reveal from "@/components/Reveal";

const steps = [
  [Code2, "Developer", "Writes and reviews code"], [GitBranch, "Git", "Branches and pull requests"], [Github, "GitHub", "Source of truth"],
  [Workflow, "GitHub Actions", "Triggers the pipeline"], [CheckCircle2, "Automated Testing", "Lint, unit and API tests"], [Boxes, "Docker", "Reproducible image"],
  [Rocket, "Deployment", "Zero-surprise releases"], [CloudCog, "Cloud Infrastructure", "Vercel · Railway · AWS"], [Activity, "Monitoring", "Health checks and alerts"],
] as const;

export default function DevOpsShowcase() {
  const reduce = useReducedMotion();
  return (
    <section id="devops" className="relative py-24" aria-labelledby="devops-title">
      <div className="absolute inset-0 -z-10 bg-surface/50" aria-hidden />
      <div className="container-x">
        <Reveal><h2 id="devops-title" className="h2">From commit to production, automated</h2><p className="lead mt-3">This site ships through the same pipeline I set up for clients: every push is linted, tested, built and deployed.</p></Reveal>
        <ol className="relative mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(([Icon, title, text], i) => (
            <motion.li key={title} initial={reduce ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.12, duration: 0.5 }} className="card relative p-5">
              <div className="flex items-center gap-3">
                <motion.span initial={reduce ? false : { scale: 0.6, backgroundColor: "rgb(var(--raised))" }} whileInView={{ scale: 1, backgroundColor: "rgb(var(--accent) / 0.18)" }} viewport={{ once: true }} transition={{ delay: i * 0.12 + 0.2 }} className="grid h-10 w-10 place-items-center rounded-lg border border-line text-accent"><Icon className="h-5 w-5" /></motion.span>
                <div><p className="font-display font-semibold">{title}</p><p className="text-sm text-muted">{text}</p></div>
              </div>
              {i < steps.length - 1 && <span className="absolute -bottom-4 left-10 hidden h-4 w-px bg-line sm:block lg:hidden" aria-hidden />}
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
