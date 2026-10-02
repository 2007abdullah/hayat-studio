import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
import type { Project } from "@/types";

export default function ProjectCard({ p, large }: { p: Project; large?: boolean }) {
  return (
    <article data-cursor="view" className="group card relative overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:border-accent/50">
      <Link href={`/projects/${p.slug}`} className="block" aria-label={`View case study: ${p.title}`}>
        <div className={`relative overflow-hidden bg-raised ${large ? "aspect-[16/10]" : "aspect-[8/5]"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image_url} alt={`${p.title} interface preview`} width={1200} height={750} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/10 to-transparent opacity-80 transition group-hover:opacity-100" />
          <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-1.5 opacity-0 transition duration-300 group-hover:opacity-100 max-md:opacity-100">
            {p.technologies.slice(0, 5).map((t) => <span key={t} className="rounded-full border border-line bg-bg/80 px-2.5 py-1 text-xs backdrop-blur">{t}</span>)}
          </div>
          <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-accent text-bg opacity-0 transition duration-300 group-hover:opacity-100"><ArrowUpRight className="h-5 w-5 transition group-hover:rotate-12" /></span>
        </div>
        <div className="p-6">
          <p className="text-xs text-accent">{p.category}</p>
          <h3 className="mt-1 font-display text-xl font-semibold">{p.title}</h3>
          <p className="mt-2 text-sm text-muted">{p.summary}</p>
          <p className="mt-4 text-sm font-medium">View Case Study</p>
        </div>
      </Link>
      {(p.live_url || p.github_url) && (
        <div className="flex gap-4 border-t border-line px-6 py-3 text-sm text-muted">
          {p.live_url && <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="hover:text-fg">Live Demo</a>}
          {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-fg"><Github className="h-4 w-4" /> GitHub</a>}
        </div>
      )}
    </article>
  );
}
