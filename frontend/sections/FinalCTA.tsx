import Button from "@/components/ui/Button";
import Reveal from "@/components/Reveal";

export default function FinalCTA() {
  return (
    <section className="container-x py-12" aria-labelledby="cta-title">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl border border-line bg-surface px-6 py-16 text-center sm:px-12 sm:py-24">
          <div className="grid-bg absolute inset-0 -z-10 animate-gridmove" aria-hidden />
          <div className="absolute left-1/2 top-0 -z-10 h-72 w-[600px] -translate-x-1/2 rounded-full bg-accent/20 blur-[100px]" aria-hidden />
          <h2 id="cta-title" className="h1 mx-auto max-w-3xl text-4xl sm:text-5xl">HAVE A PROJECT IN MIND?</h2>
          <p className="lead mx-auto mt-5">Tell me what you&apos;re building and let&apos;s turn your idea into a production-ready digital product.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3"><Button href="/order" arrow>Start a Project</Button><Button href="/#contact" variant="outline">Contact Me</Button></div>
        </div>
      </Reveal>
    </section>
  );
}
