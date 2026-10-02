import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import Logo from "./Logo";
import { site } from "@/lib/api";

const col = (title: string, items: [string, string][]) => (
  <div>
    <h3 className="mb-3 text-sm font-medium">{title}</h3>
    <ul className="space-y-2 text-sm text-muted">{items.map(([l, h]) => <li key={l}><Link href={h} className="transition hover:text-fg">{l}</Link></li>)}</ul>
  </div>
);

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line">
      <div className="grid-bg absolute inset-0 -z-10 animate-gridmove opacity-40" aria-hidden />
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">Full-Stack Developer &amp; DevOps Engineer. Web applications, scalable APIs, cloud infrastructure and AI-powered products.</p>
          <div className="mt-5 flex gap-2">
            {[[Github, site.github, "GitHub"], [Linkedin, site.linkedin, "LinkedIn"], [Mail, `mailto:${site.email}`, "Email"]].map(([Icon, href, label]: any) => (
              <a key={label} href={href} aria-label={label} target={label === "Email" ? undefined : "_blank"} rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:border-accent/60 hover:text-fg"><Icon className="h-4 w-4" /></a>
            ))}
          </div>
        </div>
        {col("Navigate", [["Services", "/#services"], ["Projects", "/projects"], ["Pricing", "/#pricing"], ["About", "/#about"], ["Contact", "/#contact"]])}
        {col("Services", [["Full-Stack Development", "/services/full-stack-web-development"], ["DevOps & Cloud", "/services/devops-cloud-deployment"], ["AI Integration", "/services/ai-integration"], ["API & Backend", "/services/api-backend-development"]])}
        {col("Account", [["Start a project", "/order"], ["Client dashboard", "/dashboard"], ["Sign in", "/login"], ["Create account", "/register"]])}
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">© {new Date().getFullYear()} Abdullah Hayat. All rights reserved.</div>
    </footer>
  );
}
