import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { AvatarSection } from "@/components/avatar-section";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <main className="flex flex-col gap-4 w-full max-w-md mx-auto p-8">
      <div className="mb-8 flex flex-row justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary">MusicSky</h1>
          <h2 className="text-sm text-muted-foreground">
            Listen and share the music in the Atmosphere.
          </h2>
        </div>
        <div className="flex flex-row gap-2">
          <ThemeToggle />
          <Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
            <AvatarSection />
          </Suspense>
        </div>
      </div>
      <Button asChild>
        <Link href="/upload">Upload a song</Link>
      </Button>
    </main>
  );
}
