import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { SongsList } from "./songs-list";

export default async function UserPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return (
    <main className="flex flex-col gap-8 w-full">
      <h1 className="text-2xl font-semibold">Songs by {handle}</h1>
      <Suspense
        fallback={
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-24 rounded-full" />
            ))}
          </>
        }
      >
        <SongsList handle={handle} />
      </Suspense>
    </main>
  );
}
