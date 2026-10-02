import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default function Page() {
  return <Suspense fallback={null}><AuthForm mode="register" /></Suspense>;
}
