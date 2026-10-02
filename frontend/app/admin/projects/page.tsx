"use client";
import CrudManager from "@/components/admin/CrudManager";

export default function Projects() {
  return <CrudManager title="Projects" endpoint="projects" titleKey="title" subKey="category"
    defaults={{ technologies: [], features: [], gallery: [], case_study: { overview: "", problem: "", solution: "", architecture: "", process: "", challenges: "", results: "", deployment: "" }, is_featured: false, is_published: true, sort_order: 0 }}
    fields={[
      { key: "title", label: "Title", type: "text", required: true }, { key: "slug", label: "Slug", type: "text", required: true }, { key: "category", label: "Category", type: "text" },
      { key: "sort_order", label: "Sort order", type: "number" }, { key: "summary", label: "Short description", type: "textarea" }, { key: "image_url", label: "Cover image", type: "image" },
      { key: "technologies", label: "Technologies", type: "list" }, { key: "features", label: "Features", type: "list" }, { key: "gallery", label: "Gallery image URLs", type: "list" },
      { key: "live_url", label: "Live demo URL", type: "text" }, { key: "github_url", label: "GitHub URL", type: "text" },
      { key: "case_study", label: "Case study (JSON: overview, problem, solution, architecture, process, challenges, results, deployment)", type: "json" },
      { key: "is_featured", label: "Featured on home page", type: "bool" }, { key: "is_published", label: "Published", type: "bool" },
    ]} />;
}
