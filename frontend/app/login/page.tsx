import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function Page() {
  return <Suspense fallback={null}><AuthForm mode="login" /></Suspense>;
}
