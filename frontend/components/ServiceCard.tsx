import Link from "next/link";
import { ArrowUpRight, Bot, Briefcase, Cloud, Layers, LayoutDashboard, Server, ShoppingCart, Wrench } from "lucide-react";
import type { Service } from "@/types";
import Button from "./ui/Button";

const icons: Record<string, any> = { layers: Layers, briefcase: Briefcase, "shopping-cart": ShoppingCart, "layout-dashboard": LayoutDashboard, cloud: Cloud, bot: Bot, server: Server, wrench: Wrench };

export default function ServiceCard({ s }: { s: Service }) {
  const Icon = icons[s.icon] || Layers;
  return (
    <article className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-accent/50">
      <div className="relative aspect-[8/5] overflow-hidden bg-raised">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.image_url} alt={`${s.title} illustration`} width={1200} height={750} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-xl border border-line bg-bg/70 text-accent backdrop-blur transition group-hover:rotate-6"><Icon className="h-5 w-5" /></span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold">{s.title}</h3>
        <p className="mt-2 text-sm text-muted">{s.description}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">{s.features.slice(0, 5).map((f) => <li key={f} className="badge">{f}</li>)}</ul>
        <div className="mt-5 flex items-end justify-between border-t border-line pt-4 text-sm">
          <div><p className="text-xs text-muted">Starting from</p><p className="font-display text-lg font-semibold">${s.starting_price.toLocaleString()}</p></div>
          <p className="text-right text-xs text-muted">Delivery<br /><span className="text-sm text-fg">{s.delivery_estimate}</span></p>
        </div>
        <div className="mt-5 flex gap-2">
          <Link href={`/services/${s.slug}`} className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-line px-4 py-2.5 text-sm transition hover:border-accent/60">Details <ArrowUpRight className="h-4 w-4" /></Link>
          <Button href={`/order?service=${s.slug}`} className="flex-1" size="sm">Order Now</Button>
        </div>
      </div>
    </article>
  );
}
