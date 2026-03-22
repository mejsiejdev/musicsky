import { Suspense } from "react";
import { Feed } from "./feed";
import { Skeleton } from "@/components/ui/skeleton";

function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-row gap-4">
          <Skeleton className="size-16 rounded-md shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="w-48 h-4" />
            <Skeleton className="w-32 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-primary">Latest Songs</h1>
      <Suspense fallback={<FeedSkeleton />}>
        <Feed />
      </Suspense>
    </main>
  );
}
