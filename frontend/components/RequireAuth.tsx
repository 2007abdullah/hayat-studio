"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Skeleton } from "./ui/misc";

export default function RequireAuth({ role, children }: { role?: "admin"; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(path)}`);
    else if (role === "admin" && user.role !== "admin") router.replace("/dashboard");
  }, [user, loading, role, router, path]);
  if (loading || !user || (role === "admin" && user.role !== "admin")) {
    return <div className="container-x space-y-4 pt-32" aria-busy="true"><Skeleton className="h-9 w-64" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div>;
  }
  return <>{children}</>;
}
