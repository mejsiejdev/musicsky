"use client";

import Link from "next/link";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

interface CommentAuthor {
  did: string;
  handle: string;
  pds: string;
}

interface ProfileData {
  avatar?: string;
  displayName?: string;
  handle: string;
}

async function fetchProfile(did: string): Promise<ProfileData | null> {
  try {
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${did}`,
    );
    if (!res.ok) return null;
    return (await res.json()) as ProfileData;
  } catch {
    return null;
  }
}

export function Comment({
  text,
  author,
  createdAt,
}: {
  text: string;
  author: CommentAuthor;
  createdAt: string;
}) {
  const { data: profile } = useSWR(`profile-${author.did}`, () =>
    fetchProfile(author.did),
  );

  const createdAtDate = new Date(createdAt);

  return (
    <div className="flex flex-row gap-3">
      <Link href={`/${author.handle}`} className="shrink-0">
        <Avatar size="lg">
          {profile?.avatar && (
            <AvatarImage src={profile.avatar} alt={author.handle} />
          )}
          <AvatarFallback>{author.handle.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex flex-row items-center gap-2">
          <Link
            href={`/${author.handle}`}
            className="text-sm font-medium hover:underline truncate"
          >
            {profile?.displayName ?? author.handle}
          </Link>
          <p className="text-sm text-muted-foreground">@{author.handle}</p>
          <p className="text-sm text-muted-foreground">·</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <time
                dateTime={createdAt}
                className="text-xs text-muted-foreground shrink-0"
              >
                {formatDistanceToNow(createdAtDate, {
                  addSuffix: true,
                })}
              </time>
            </TooltipTrigger>
            <TooltipContent>{format(createdAtDate, "PPP p")}</TooltipContent>
          </Tooltip>
        </div>
        <p className="text-sm break-words">{text}</p>
      </div>
    </div>
  );
}
