import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function Page() {
  return <Suspense fallback={null}><AuthForm mode="forgot" /></Suspense>;
}
