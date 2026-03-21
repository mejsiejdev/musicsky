import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { SongsList } from "./songs-list";

export default async function UserPage({
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
                <div className="w-full flex flex-row gap-4">
                  <Skeleton className="size-24 rounded-md" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="w-48 h-6" />
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-24 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </>
        }
      >
        <SongsList params={params} />
      </Suspense>
    </div>
  );
}
