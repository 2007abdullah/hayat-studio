import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { serverApi } from "@/lib/api";
import type { Service } from "@/types";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const s = await serverApi<Service>(`/services/${params.slug}`);
  return s ? { title: s.title, description: s.description, alternates: { canonical: `/services/${s.slug}` } } : { title: "Service not found" };
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const s = await serverApi<Service>(`/services/${params.slug}`);
  if (!s) notFound();
  return (
    <div className="container-x pb-12 pt-32">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h1 className="h1 text-4xl sm:text-5xl">{s.title}</h1>
          <p className="lead mt-5">{s.description}</p>
          <p className="mt-6 text-sm text-muted">Starting from <b className="font-display text-xl text-fg">${s.starting_price.toLocaleString()}</b> · Delivery {s.delivery_estimate}</p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">{s.features.map((f) => <li key={f} className="flex gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{f}</li>)}</ul>
          <div className="mt-8 flex flex-wrap gap-3"><Button href={`/order?service=${s.slug}`} arrow>Order Now</Button><Button href="/#contact" variant="outline">Ask a question</Button></div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.image_url} alt={`${s.title} illustration`} width={1200} height={750} className="card w-full object-cover" />
      </div>
    </div>
  );
}
