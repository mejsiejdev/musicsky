import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { Pager } from "@/components/pager";
import { Info } from "./info";

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ handle: string }>;
}>) {
  return (
    <main className="flex flex-col gap-8 w-full">
      <div className="flex flex-col">
        <Suspense fallback={<Skeleton className="w-full h-24" />}>
          <Info params={params} />
        </Suspense>
        <Suspense fallback={<Skeleton className="w-full h-24" />}>
          <Pager params={params} />
        </Suspense>
      </div>
      {children}
    </main>
  );
}
