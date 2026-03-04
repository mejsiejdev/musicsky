import { getSession } from "@/lib/auth/session";
import { LogoutButton } from "@/components/logout-button";
import { redirect } from "next/navigation";
import { Agent } from "@atproto/api";
import Image from "next/image";
import { Activity } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const agent = new Agent(session);
  const { data: profile } = await agent.getProfile({ actor: session.did });

  return (
    <main className="flex flex-col gap-4 w-full max-w-md mx-auto p-8">
      <div className="mb-8 flex flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">MusicSky</h1>
        <ThemeToggle />
      </div>

      <div className="bg-card rounded-lg border border-input p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-row gap-4 items-center">
              <Activity mode={profile.avatar ? "visible" : "hidden"}>
                <Image
                  src={profile.avatar!}
                  alt={profile.handle}
                  className="size-12 rounded-full"
                  width={100}
                  height={100}
                />
              </Activity>
              <div className="flex flex-col">
                <Activity mode={profile.displayName ? "visible" : "hidden"}>
                  <p className="font-semibold">{profile.displayName}</p>
                </Activity>
                <Link
                  href={`/${profile.handle}`}
                  className={cn(
                    profile.displayName && "text-sm text-muted-foreground",
                  )}
                >
                  @{profile.handle}
                </Link>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
      <Button asChild>
        <Link href="/upload">Upload a song</Link>
      </Button>
    </main>
  );
}
