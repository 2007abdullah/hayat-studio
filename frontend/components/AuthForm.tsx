"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "./AuthProvider";
import { Input } from "./ui/Field";
import Button from "./ui/Button";
import type { User } from "@/types";

export default function AuthForm({ mode }: { mode: "login" | "register" | "forgot" | "reset" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true); setErrors({}); setNote("");
    try {
      if (mode === "forgot") { const r = await api<{ detail: string }>("/auth/forgot-password", { method: "POST", json: d }); setNote(r.detail); }
      else if (mode === "reset") { await api("/auth/reset-password", { method: "POST", json: { token: params.get("token") || "", password: d.password } }); toast.success("Password updated. Please sign in."); router.push("/login"); }
      else {
        const u = await api<User>(`/auth/${mode}`, { method: "POST", json: d });
        setUser(u); toast.success(mode === "login" ? "Signed in" : "Account created");
        const next = params.get("next");
        router.push(next && next.startsWith("/") ? next : u.role === "admin" ? "/admin" : "/dashboard");
        router.refresh();
      }
    } catch (err) {
      if (err instanceof ApiError) { setErrors(err.fields); toast.error(err.message); } else toast.error("Something went wrong. Try again.");
    } finally { setBusy(false); }
  }

  const titles = { login: "Sign in", register: "Create your account", forgot: "Reset your password", reset: "Choose a new password" };
  return (
    <div className="container-x flex min-h-[80vh] items-center justify-center pb-12 pt-28">
      <form onSubmit={submit} className="card w-full max-w-md space-y-4 p-8" noValidate>
        <h1 className="font-display text-2xl font-semibold">{titles[mode]}</h1>
        {mode === "register" && <Input label="Full name" name="full_name" required autoComplete="name" error={errors.full_name} />}
        {mode !== "reset" && <Input label="Email" name="email" type="email" required autoComplete="email" error={errors.email} />}
        {mode !== "forgot" && <Input label={mode === "reset" ? "New password" : "Password"} name="password" type="password" required minLength={mode === "login" ? undefined : 8} autoComplete={mode === "login" ? "current-password" : "new-password"} error={errors.password} hint={mode === "login" ? undefined : "At least 8 characters"} />}
        {note && <p role="status" className="text-sm text-emerald-300">{note}</p>}
        <Button type="submit" loading={busy} className="w-full">{titles[mode]}</Button>
        <div className="flex justify-between text-sm text-muted">
          {mode === "login" && <><Link href="/register" className="hover:text-fg">Create account</Link><Link href="/forgot-password" className="hover:text-fg">Forgot password?</Link></>}
          {mode === "register" && <Link href="/login" className="hover:text-fg">Already have an account?</Link>}
          {(mode === "forgot" || mode === "reset") && <Link href="/login" className="hover:text-fg">Back to sign in</Link>}
        </div>
      </form>
    </div>
  );
}
