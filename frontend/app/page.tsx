import Hero from "@/sections/Hero";
import TechStack from "@/sections/TechStack";
import DevOpsShowcase from "@/sections/DevOpsShowcase";
import Pricing from "@/sections/Pricing";
import Testimonials from "@/sections/Testimonials";
import About from "@/sections/About";
import ContactSection from "@/sections/ContactSection";
import FinalCTA from "@/sections/FinalCTA";
import ServiceCard from "@/components/ServiceCard";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/misc";
import { serverApi } from "@/lib/api";
import type { Project, Service, Testimonial } from "@/types";

export const revalidate = 60;

export default async function Home() {
  const [services, projects, testimonials, stats] = await Promise.all([
    serverApi<Service[]>("/services"), serverApi<Project[]>("/projects"), serverApi<Testimonial[]>("/testimonials"),
    serverApi<{ items: { label: string; value: string }[] }>("/stats"),
  ]);
  return (
    <>
      <Hero />
      <TechStack />
      <section id="services" className="container-x py-24" aria-labelledby="services-title">
        <Reveal><h2 id="services-title" className="h2">Services</h2><p className="lead mt-3">Pick a service, describe your project and track it from request to launch.</p></Reveal>
        {services?.length ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{services.map((s, i) => <Reveal key={s.id} delay={(i % 4) * 0.06}><ServiceCard s={s} /></Reveal>)}</div>
        ) : <div className="mt-12"><EmptyState title="Services are loading soon" text="The API isn't reachable right now. Start the backend and refresh." /></div>}
      </section>
      <section id="projects" className="container-x py-24" aria-labelledby="projects-title">
        <Reveal><h2 id="projects-title" className="h2">Featured projects</h2><p className="lead mt-3">Product builds covering SaaS, AI, commerce and automation.</p></Reveal>
        {projects?.length ? (
          <>
            <div className="mt-12 grid gap-5 md:grid-cols-2">{projects.slice(0, 4).map((p, i) => <Reveal key={p.id} delay={(i % 2) * 0.08}><ProjectCard p={p} large={i === 0} /></Reveal>)}</div>
            <div className="mt-10 text-center"><Button href="/projects" variant="outline" arrow>See all projects</Button></div>
          </>
        ) : <div className="mt-12"><EmptyState title="Projects are loading soon" /></div>}
      </section>
      <DevOpsShowcase />
      <Pricing />
      <Testimonials items={testimonials ?? []} />
      <About stats={stats?.items ?? []} />
      <ContactSection />
      <FinalCTA />
    </>
  );
}
