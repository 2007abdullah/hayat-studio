"use client";
import { Toaster } from "sonner";
import AuthProvider from "./AuthProvider";
import SmoothScroll from "./SmoothScroll";
import Cursor from "./Cursor";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SmoothScroll />
      <Cursor />
      {children}
      <Toaster position="bottom-right" theme="system" toastOptions={{ classNames: { toast: "!bg-surface !border-line !text-fg" } }} />
    </AuthProvider>
  );
}
