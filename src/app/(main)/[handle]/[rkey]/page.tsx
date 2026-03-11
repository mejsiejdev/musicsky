import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { SongView } from "./song-view";

export default async function SongPage({
  params,
}: {
  params: Promise<{ handle: string; rkey: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-row gap-4">
          <div className="w-full flex flex-row gap-4">
            <Skeleton className="size-24 rounded-md" />
            <div className="flex flex-col gap-2">
              <Skeleton className="w-48 h-6" />
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-24 h-4" />
            </div>
          </div>
        </div>
      }
    >
      <SongView params={params} />
    </Suspense>
  );
}
