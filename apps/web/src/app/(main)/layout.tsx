import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AvatarSection } from "@/components/avatar-section";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { HomeIcon } from "lucide-react";
import Image from "next/image";
import { PlayerBar } from "@/components/player-bar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-row min-h-screen items-start justify-center bg-background">
      <div className="flex flex-col justify-between gap-4 w-60 border-r border-border h-screen p-4">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <div className="flex flex-row items-baseline justify-between">
              <h1 className="text-3xl font-bold text-primary">Musicsky</h1>
            </div>
            <h2 className="text-sm text-muted-foreground">
              Listen and share the music in the Atmosphere.
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild variant="ghost" className="justify-start">
              <Link href="/">
                <HomeIcon />
                Home
              </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start px-3">
              <a
                href="https://tangled.org/mejsiejdev.bsky.social/musicsky"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/tangled-dolly.png"
                  alt="Tangled Dolly"
                  width={16}
                  height={16}
                  className="dark:invert"
                />
                Source
              </a>
            </Button>
            <ThemeToggle variant="nav" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Suspense fallback={<Skeleton className="w-full h-9 rounded-full" />}>
            <AvatarSection />
          </Suspense>
        </div>
      </div>
      <div className="max-w-lg flex flex-col w-full h-screen border-r border-border">
        <div className="p-4 overflow-y-auto h-full">{children}</div>
        <PlayerBar />
      </div>
    </div>
  );
}
