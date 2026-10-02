import Reveal from "@/components/Reveal";

type Stat = { label: string; value: string };
const principles = [
  ["Ship something real", "Working software in production beats polished mockups. I deploy early and iterate."],
  ["Automate the boring parts", "Tests, builds and deployments should run themselves so releases stay calm."],
  ["Own the whole path", "Interface, API, database and infrastructure are designed together, not handed over a wall."],
];

export default function About({ stats }: { stats: Stat[] }) {
  return (
    <section id="about" className="container-x grid gap-12 py-24 lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="about-title">
      <Reveal>
        <div className="card overflow-hidden">
          {/* Replace /img/portrait.svg with your photo in frontend/public/img/ */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/portrait.svg" alt="Portrait of Abdullah Hayat (placeholder - replace with your photo)" width={1200} height={750} loading="lazy" className="aspect-[4/3] w-full object-cover" />
        </div>
      </Reveal>
      <div>
        <Reveal><h2 id="about-title" className="h2">Turning ideas into production-ready digital products.</h2></Reveal>
        <Reveal delay={0.08}><p className="lead mt-5">I&apos;m Abdullah Hayat, a freelance full-stack developer and DevOps engineer. I design, build and deploy web applications end to end, from the interface and API to the database, CI/CD pipeline and cloud hosting, and add AI features where they genuinely help.</p></Reveal>
        <ul className="mt-8 space-y-4">
          {principles.map(([t, d], i) => <Reveal as="li" key={t} delay={0.1 + i * 0.06}><p className="font-display font-semibold">{t}</p><p className="text-sm text-muted">{d}</p></Reveal>)}
        </ul>
        {stats.length > 0 && (
          <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => <div key={s.label} className="card p-4"><dd className="font-display text-2xl font-semibold text-accent">{s.value}</dd><dt className="text-xs text-muted">{s.label}</dt></div>)}
          </dl>
        )}
      </div>
    </section>
  );
}
