import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import Button from "@/components/ui/Button";
import CaseStudyNav from "@/components/CaseStudyNav";
import Gallery from "@/components/Gallery";
import { serverApi, site } from "@/lib/api";
import type { Project } from "@/types";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await serverApi<Project>(`/projects/${params.slug}`);
  if (!p) return { title: "Project not found" };
  return { title: p.title, description: p.summary, alternates: { canonical: `/projects/${p.slug}` }, openGraph: { title: p.title, description: p.summary, images: [{ url: p.image_url }] } };
}

const SECTIONS: [keyof NonNullable<Project["case_study"]>, string][] = [
  ["overview", "Overview"], ["problem", "Problem"], ["solution", "Solution"], ["architecture", "Architecture"], ["process", "Development process"],
  ["challenges", "Challenges"], ["results", "Results"], ["deployment", "Deployment"],
];

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const p = await serverApi<Project>(`/projects/${params.slug}`);
  if (!p) notFound();
  const sections = SECTIONS.filter(([k]) => p.case_study?.[k]);
  const nav = [...sections.map(([k, l]) => ({ id: k, label: l })), ...(p.features.length ? [{ id: "features", label: "Features" }] : []), { id: "technologies", label: "Technologies" }, ...(p.gallery.length ? [{ id: "screens", label: "Screenshots" }] : [])];
  const ld = { "@context": "https://schema.org", "@type": "CreativeWork", name: p.title, description: p.summary, image: `${site.url}${p.image_url}`, keywords: p.technologies.join(", "), author: { "@type": "Person", name: "Abdullah Hayat" } };
  return (
    <article className="pb-12 pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="container-x">
        <Link href="/projects" className="text-sm text-muted hover:text-fg">← All projects</Link>
        <p className="mt-6 text-sm text-accent">{p.category}</p>
        <h1 className="h1 mt-2">{p.title}</h1>
        <p className="lead mt-4">{p.summary}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {p.live_url && <Button href={p.live_url} variant="primary" size="sm"><ExternalLink className="h-4 w-4" /> Live Demo</Button>}
          {p.github_url && <Button href={p.github_url} variant="outline" size="sm"><Github className="h-4 w-4" /> GitHub</Button>}
          <Button href="/order" variant="outline" size="sm" arrow>Start a similar project</Button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image_url} alt={`${p.title} hero image`} width={1200} height={750} className="card mt-10 w-full object-cover" />
      </div>
      <div className="container-x mt-12 grid gap-10 lg:grid-cols-[220px_1fr]">
        <CaseStudyNav items={nav} />
        <div className="max-w-3xl space-y-12">
          {sections.map(([k, label]) => <section key={k} id={k} className="scroll-mt-24"><h2 className="h2 text-2xl sm:text-3xl">{label}</h2><p className="mt-3 leading-relaxed text-muted">{p.case_study[k]}</p></section>)}
          {p.features.length > 0 && <section id="features" className="scroll-mt-24"><h2 className="h2 text-2xl sm:text-3xl">Features</h2><ul className="mt-4 grid gap-2 sm:grid-cols-2">{p.features.map((f) => <li key={f} className="card px-4 py-3 text-sm">{f}</li>)}</ul></section>}
          <section id="technologies" className="scroll-mt-24"><h2 className="h2 text-2xl sm:text-3xl">Technologies</h2><ul className="mt-4 flex flex-wrap gap-2">{p.technologies.map((t) => <li key={t} className="badge text-sm">{t}</li>)}</ul></section>
          {p.gallery.length > 0 && <section id="screens" className="scroll-mt-24"><h2 className="h2 text-2xl sm:text-3xl">Screenshots</h2><Gallery images={p.gallery} title={p.title} /></section>}
        </div>
      </div>
    </article>
  );
}
