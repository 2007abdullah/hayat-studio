import RequireAuth from "@/components/RequireAuth";

export const metadata = { title: "Dashboard", robots: { index: false } };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequireAuth><div className="container-x pb-12 pt-28">{children}</div></RequireAuth>;
}
