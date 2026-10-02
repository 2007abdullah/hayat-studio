"use client";
import { Bot, Braces, Cloud, Database, Server } from "lucide-react";
import Reveal from "@/components/Reveal";

const groups = [
  { name: "Frontend", Icon: Braces, items: [["HTML", "Semantic, accessible markup"], ["CSS", "Layouts, animation, design systems"], ["JavaScript", "The language of the browser"], ["TypeScript", "Typed, maintainable code"], ["React", "Component-driven interfaces"], ["Next.js", "SSR, routing, SEO"], ["Tailwind", "Rapid, consistent styling"]] },
  { name: "Backend", Icon: Server, items: [["Python", "APIs, automation, data"], ["FastAPI", "Fast, typed REST APIs"], ["Node.js", "JavaScript on the server"], ["PHP", "Maintaining and extending web apps"]] },
  { name: "Database", Icon: Database, items: [["PostgreSQL", "Relational data, done right"], ["MySQL", "Widely hosted relational DB"], ["MongoDB", "Flexible document storage"]] },
  { name: "DevOps", Icon: Cloud, items: [["Docker", "Reproducible environments"], ["GitHub Actions", "Automated CI/CD"], ["AWS", "Cloud infrastructure"], ["Vercel", "Frontend hosting"], ["Railway", "Backend hosting"], ["Linux", "Servers and tooling"]] },
  { name: "AI", Icon: Bot, items: [["OpenAI APIs", "LLM-powered features"], ["AI Agents", "Tool-using assistants"], ["RAG", "Answers grounded in your data"], ["n8n", "Workflow automation"], ["Automation", "Remove repetitive work"]] },
] as const;

export default function TechStack() {
  return (
    <section id="stack" className="container-x py-24" aria-labelledby="stack-title">
      <Reveal><h2 id="stack-title" className="h2">The tools I build with</h2><p className="lead mt-3">A focused stack covering the whole path from interface to infrastructure.</p></Reveal>
      <div className="mt-12 space-y-10">
        {groups.map(({ name, Icon, items }) => (
          <div key={name}>
            <Reveal><h3 className="mb-4 flex items-center gap-2 font-display text-lg font-medium"><Icon className="h-5 w-5 text-accent" /> {name}</h3></Reveal>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map(([tech, desc], i) => (
                <Reveal as="li" key={tech} delay={i * 0.04} y={14}>
                  <div tabIndex={0} className="group relative h-full overflow-hidden rounded-xl border border-line bg-surface p-4 transition duration-300 hover:-translate-y-0.5 hover:border-accent/60 focus-visible:border-accent/60">
                    <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/0 blur-2xl transition duration-500 group-hover:bg-accent/25 group-focus-visible:bg-accent/25" aria-hidden />
                    <p className="font-display font-semibold">{tech}</p>
                    <p className="mt-0.5 text-xs text-accent">{name}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted transition group-hover:text-fg/80">{desc}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
