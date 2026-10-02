"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  return (
    <>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {images.map((src, i) => (
          <li key={src + i}><button onClick={() => setOpen(src)} className="card block w-full cursor-zoom-in overflow-hidden" aria-label={`Zoom screenshot ${i + 1} of ${title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${title} screenshot ${i + 1}`} loading="lazy" width={1200} height={750} className="w-full transition duration-500 hover:scale-105" />
          </button></li>
        ))}
      </ul>
      <AnimatePresence>
        {open && (
          <motion.div role="dialog" aria-modal="true" aria-label="Screenshot preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} className="fixed inset-0 z-[90] grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
            <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-raised" aria-label="Close preview"><X className="h-5 w-5" /></button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img initial={{ scale: 0.94 }} animate={{ scale: 1 }} src={open} alt={`${title} screenshot enlarged`} className="max-h-[88vh] max-w-full rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
