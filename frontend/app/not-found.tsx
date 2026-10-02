import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center gap-4 pt-24 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="h2">This page doesn&apos;t exist</h1>
      <p className="lead">The link may be broken, or the page may have moved.</p>
      <Button href="/" arrow>Back to home</Button>
    </div>
  );
}
