import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { PlaylistsList } from "./playlists-list";

export default async function PlaylistsPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Suspense
        fallback={
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex flex-row gap-4">
                <Skeleton className="size-16 rounded-md" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="w-48 h-6" />
                  <Skeleton className="w-32 h-4" />
                </div>
              </div>
            ))}
          </>
        }
      >
        <PlaylistsList params={params} />
      </Suspense>
    </div>
  );
}
