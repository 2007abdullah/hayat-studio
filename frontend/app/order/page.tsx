import { Suspense } from "react";
import type { Metadata } from "next";
import OrderForm from "./OrderForm";

export const metadata: Metadata = { title: "Start a Project", description: "Describe your project and get a custom quote from Abdullah Hayat.", alternates: { canonical: "/order" } };

export default function OrderPage() {
  return (
    <div className="container-x pb-12 pt-32">
      <h1 className="h1">Start a project</h1>
      <p className="lead mt-4">Tell me what you need. You&apos;ll get an order number right away and a reply within one business day.</p>
      <Suspense fallback={<div className="skeleton mt-10 h-96" />}><OrderForm /></Suspense>
    </div>
  );
}
