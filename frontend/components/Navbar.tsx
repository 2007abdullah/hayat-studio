"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import Button from "./ui/Button";
import { useAuth } from "./AuthProvider";

const links = [
  { href: "/#services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);

  const portal = user ? (user.role === "admin" ? { href: "/admin", label: "Admin" } : { href: "/dashboard", label: "Dashboard" }) : null;

  return (
    <header className={clsx("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled ? "glass border-x-0 border-t-0" : "border-b border-transparent")}>
      <motion.div style={{ scaleX: progress }} className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent" aria-hidden />
      <nav className="container-x flex h-16 items-center justify-between" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = l.href === "/projects" && pathname.startsWith("/projects");
            return (
              <li key={l.href}>
                <Link href={l.href} className={clsx("relative rounded-full px-3.5 py-2 text-sm transition", active ? "text-fg" : "text-muted hover:text-fg")}>
                  {active && <motion.span layoutId="nav-active" className="absolute inset-0 -z-10 rounded-full bg-raised" />}
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {portal ? (<><Button href={portal.href} variant="outline" size="sm">{portal.label}</Button><Button variant="ghost" size="sm" onClick={logout}>Sign out</Button></>) : <Button href="/login" variant="ghost" size="sm">Sign in</Button>}
          <Button href="/order" size="sm" arrow>Start a Project</Button>
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-full border border-line md:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}
            className="absolute inset-x-0 top-16 h-[calc(100dvh-4rem)] overflow-y-auto bg-bg/95 backdrop-blur-xl md:hidden">
            <div className="container-x flex flex-col gap-1 py-6">
              {[...links, ...(portal ? [portal] : [{ href: "/login", label: "Sign in" }])].map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3.5 font-display text-2xl hover:bg-raised">{l.label}</Link>
                </motion.div>
              ))}
              <div className="mt-6 flex items-center gap-3"><Button href="/order" arrow className="flex-1">Start a Project</Button><ThemeToggle /></div>
              {user && <Button variant="ghost" className="mt-2" onClick={logout}>Sign out</Button>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
