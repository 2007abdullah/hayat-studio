"use client";
import CrudManager from "@/components/admin/CrudManager";

export default function Services() {
  return <CrudManager title="Services" endpoint="services" titleKey="title" subKey="slug"
    defaults={{ icon: "layers", features: [], starting_price: 0, is_active: true, sort_order: 0, image_url: "" }}
    fields={[
      { key: "title", label: "Title", type: "text", required: true }, { key: "slug", label: "Slug (lowercase-with-dashes)", type: "text", required: true },
      { key: "icon", label: "Icon", type: "text", help: "layers, briefcase, shopping-cart, layout-dashboard, cloud, bot, server, wrench" },
      { key: "starting_price", label: "Starting price (USD)", type: "number", required: true }, { key: "delivery_estimate", label: "Delivery estimate", type: "text" },
      { key: "sort_order", label: "Sort order", type: "number" }, { key: "description", label: "Description", type: "textarea", required: true },
      { key: "features", label: "Features", type: "list" }, { key: "image_url", label: "Image URL", type: "image" }, { key: "is_active", label: "Enabled (visible on the site)", type: "bool" },
    ]} />;
}
