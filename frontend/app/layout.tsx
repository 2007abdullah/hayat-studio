import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { site } from "@/lib/api";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const title = "Abdullah Hayat | Full-Stack Developer & DevOps Engineer";
const description = "Freelance full-stack developer and DevOps engineer building high-performance web applications, scalable APIs, cloud infrastructure and AI-powered solutions.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: "%s | Abdullah Hayat" },
  description,
  keywords: ["Full Stack Developer", "Freelance Full Stack Developer", "DevOps Engineer", "Web Developer", "Python Developer", "React Developer", "Next.js Developer", "AI Integration Developer"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: site.url, siteName: "Abdullah Hayat", title, description, images: [{ url: "/img/services/full-stack-web-development.svg", width: 1200, height: 750, alt: "Abdullah Hayat - Full-Stack Developer & DevOps Engineer" }] },
  twitter: { card: "summary_large_image", title, description },
  icons: { icon: "/favicon.svg" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#080b10", width: "device-width", initialScale: 1 };

const themeScript = `try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;
const jsonLd = {
  "@context": "https://schema.org", "@type": "Person", name: "Abdullah Hayat", jobTitle: "Full-Stack Developer & DevOps Engineer", url: site.url,
  sameAs: [site.github, site.linkedin], knowsAbout: ["Next.js", "React", "Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "AI integration"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-bg">Skip to content</a>
        <Providers>
          <Navbar />
          <main id="main" className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
