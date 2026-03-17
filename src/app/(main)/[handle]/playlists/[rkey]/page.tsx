import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { PlaylistView } from "./playlist-view";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ handle: string; rkey: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6">
          <div className="flex flex-row gap-4">
            <Skeleton className="size-24 rounded-md" />
            <div className="flex flex-col gap-2">
              <Skeleton className="w-48 h-6" />
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-24 h-4" />
            </div>
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex flex-row gap-4">
              <Skeleton className="size-24 rounded-md" />
              <div className="flex flex-col gap-2">
                <Skeleton className="w-48 h-6" />
                <Skeleton className="w-32 h-4" />
              </div>
            </div>
          ))}
        </div>
      }
    >
      <PlaylistView params={params} />
    </Suspense>
  );
}
