import type { Metadata } from "next";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import { EmptyState } from "@/components/ui/misc";
import { serverApi } from "@/lib/api";
import type { Project } from "@/types";

export const metadata: Metadata = { title: "Projects", description: "Case studies in full-stack development, DevOps, SaaS and AI integration.", alternates: { canonical: "/projects" } };
export const revalidate = 60;

export default async function Projects() {
  const projects = await serverApi<Project[]>("/projects");
  return (
    <div className="container-x pb-12 pt-32">
      <h1 className="h1">Projects</h1>
      <p className="lead mt-4">Selected work and the thinking behind it.</p>
      {projects?.length ? <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{projects.map((p, i) => <Reveal key={p.id} delay={(i % 3) * 0.07}><ProjectCard p={p} /></Reveal>)}</div> : <div className="mt-12"><EmptyState title="No projects yet" text="Add projects from the admin dashboard." /></div>}
    </div>
  );
}
