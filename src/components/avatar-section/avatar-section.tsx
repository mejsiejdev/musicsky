import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Agent } from "@atproto/api";
import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { EllipsisIcon } from "lucide-react";

export async function AvatarSection() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const agent = new Agent(session);
  const { data: profile } = await agent.getProfile({ actor: session.did });
  return (
    <div className="flex flex-row justify-between items-center">
      <div className="flex flex-row items-center gap-2">
        <Avatar>
          <AvatarImage src={profile.avatar} alt={profile.handle} />
          <AvatarFallback>{profile.handle.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-sm font-medium">{profile.displayName}</p>
          <p className="text-xs text-muted-foreground">@{profile.handle}</p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-32" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href={`/${profile.handle}`}>Go to profile</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <LogoutButton />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
