import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AvatarSection } from "@/components/avatar-section";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { HomeIcon } from "lucide-react";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-row gap-4 min-h-screen items-start justify-center bg-background">
      <div className="flex flex-col justify-between gap-4 w-60 border-r border-border h-screen p-4">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <div className="flex flex-row items-baseline justify-between">
              <h1 className="text-3xl font-bold text-primary">MusicSky</h1>
              <ThemeToggle />
            </div>
            <h2 className="text-sm text-muted-foreground">
              Listen and share the music in the Atmosphere.
            </h2>
          </div>
          <Button asChild variant="ghost" className="justify-start">
            <Link href="/">
              <HomeIcon />
              Home
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <Suspense fallback={<Skeleton className="w-full h-9 rounded-full" />}>
            <AvatarSection />
          </Suspense>
          <Button asChild>
            <Link href="/upload">Upload a song</Link>
          </Button>
        </div>
      </div>
      <div className="max-w-lg w-full p-4">{children}</div>
    </div>
  );
}
