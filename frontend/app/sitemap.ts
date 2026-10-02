import type { MetadataRoute } from "next";
import { serverApi, site } from "@/lib/api";
import type { Project, Service } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, services] = await Promise.all([serverApi<Project[]>("/projects"), serverApi<Service[]>("/services")]);
  const now = new Date();
  return [
    ...["", "/projects", "/order", "/login", "/register"].map((p) => ({ url: `${site.url}${p}`, lastModified: now })),
    ...(projects ?? []).map((p) => ({ url: `${site.url}/projects/${p.slug}`, lastModified: now })),
    ...(services ?? []).map((s) => ({ url: `${site.url}/services/${s.slug}`, lastModified: now })),
  ];
}
