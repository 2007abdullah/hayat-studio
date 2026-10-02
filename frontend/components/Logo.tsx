import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-display text-[17px] font-semibold tracking-tight" aria-label="Abdullah Hayat - home">
      <span className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-raised">
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden><path d="M9 22V10l7 8 7-8v12" fill="none" stroke="rgb(var(--accent))" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      Abdullah Hayat
    </Link>
  );
}
