"use client";
import Button from "@/components/ui/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center gap-4 pt-24 text-center">
      <h1 className="h2">Something went wrong</h1>
      <p className="lead">An unexpected error occurred. Try again, and if it keeps happening, contact me.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
