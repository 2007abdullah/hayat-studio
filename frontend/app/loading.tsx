import { Skeleton } from "@/components/ui/misc";

export default function Loading() {
  return (
    <div className="container-x space-y-5 pt-32" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-10 w-2/3" /><Skeleton className="h-5 w-1/2" />
      <div className="grid gap-4 pt-6 sm:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-56" />)}</div>
    </div>
  );
}
