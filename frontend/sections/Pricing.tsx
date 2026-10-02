import { Check } from "lucide-react";
import Reveal from "@/components/Reveal";
import Button from "@/components/ui/Button";

// Edit these packages to match your real offering. Prices are indicative, not binding.
const plans = [
  { id: "starter", name: "Starter", for: "Small websites", from: 400, time: "1-3 weeks", features: ["Up to 5 pages", "Responsive design", "Contact form", "Basic SEO", "Deployment & SSL"], featured: false },
  { id: "professional", name: "Professional", for: "Businesses and startups", from: 1500, time: "3-8 weeks", features: ["Custom design", "Backend & database", "User authentication", "Admin dashboard", "CI/CD & Docker", "30 days of support"], featured: true },
  { id: "premium", name: "Premium", for: "Complete custom applications", from: 4000, time: "8+ weeks", features: ["Full product build", "SaaS / multi-user architecture", "AI integration options", "Cloud infrastructure", "Monitoring & documentation", "Priority support"], featured: false },
];

export default function Pricing() {
  return (
    <section id="pricing" className="container-x py-24" aria-labelledby="pricing-title">
      <Reveal><h2 id="pricing-title" className="h2">Packages</h2><p className="lead mt-3">Every project is scoped individually. These are starting points, not fixed quotes.</p></Reveal>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {plans.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <div className={`card relative flex h-full flex-col p-7 ${p.featured ? "border-accent/60 shadow-[0_0_60px_-20px_rgb(var(--accent)/0.5)]" : ""}`}>
              {p.featured && <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-bg">Most chosen</span>}
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <p className="text-sm text-muted">{p.for}</p>
              <p className="mt-6 text-xs text-muted">Starting from</p>
              <p className="font-display text-4xl font-semibold">${p.from.toLocaleString()}</p>
              <p className="mt-1 text-sm text-muted">Estimated timeline: {p.time}</p>
              <ul className="my-6 flex-1 space-y-2.5 text-sm">{p.features.map((f) => <li key={f} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{f}</li>)}</ul>
              <Button href={`/order?plan=${p.id}`} variant={p.featured ? "primary" : "outline"} arrow>Get Custom Quote</Button>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
