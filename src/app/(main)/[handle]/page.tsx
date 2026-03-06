import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { SongsList } from "./songs-list";
import { Info } from "./info";

export default async function UserPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return (
    <main className="flex flex-col gap-8 w-full">
      <Suspense fallback={<Skeleton className="w-full h-24" />}>
        <Info params={params} />
      </Suspense>
      <Suspense
        fallback={
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-24 rounded-full" />
            ))}
          </>
        }
      >
        <SongsList params={params} />
      </Suspense>
    </main>
  );
}
