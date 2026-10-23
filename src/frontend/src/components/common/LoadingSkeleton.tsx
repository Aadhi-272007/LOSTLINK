import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SKELETON_IDS = Array.from({ length: 6 }, (_, i) => `item-skeleton-${i}`);

export function ItemCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-xl border-border shadow-subtle",
        className,
      )}
    >
      <Skeleton className="h-44 w-full rounded-none" />
      <CardHeader className="gap-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </CardFooter>
    </Card>
  );
}

export function ItemGridSkeleton({ count = 6 }: { count?: number }) {
  const ids = SKELETON_IDS.slice(0, count);
  return (
    <div
      data-ocid="loading_state"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-live="polite"
    >
      {ids.map((id) => (
        <ItemCardSkeleton key={id} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div
      data-ocid="loading_state"
      className="grid gap-8 lg:grid-cols-[1.6fr_1fr]"
      aria-busy="true"
    >
      <div className="space-y-6">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  const ids = SKELETON_IDS.slice(0, rows);
  return (
    <div data-ocid="loading_state" className="space-y-3" aria-busy="true">
      {ids.map((id) => (
        <Skeleton key={id} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}
