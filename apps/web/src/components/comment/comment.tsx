"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { formatDistanceToNow, format } from "date-fns";
import { MessageCircleReplyIcon, TrashIcon, Loader2Icon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { deleteComment } from "./actions";

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
  uri,
  cid,
  text,
  author,
  createdAt,
  deleted,
  isOwn,
  isLoggedIn,
  trackUri,
  showThreadLine,
  onReply,
}: {
  uri: string;
  cid: string;
  text: string;
  author: CommentAuthor;
  createdAt: string;
  deleted?: boolean;
  isOwn?: boolean;
  isLoggedIn?: boolean;
  trackUri: string;
  showThreadLine?: boolean;
  onReply?: (uri: string, cid: string, handle: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const { data: profile } = useSWR(
    deleted ? null : `profile-${author.did}`,
    () => fetchProfile(author.did),
  );

  const createdAtDate = new Date(createdAt);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteComment(uri, trackUri);
    } finally {
      setDeleting(false);
    }
  }

  if (deleted) {
    return (
      <CommentLayout
        showThreadLine={showThreadLine}
        avatar={
          <Avatar size="lg">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        }
      >
        <p className="text-sm text-muted-foreground italic">[deleted]</p>
      </CommentLayout>
    );
  }

  return (
    <CommentLayout
      showThreadLine={showThreadLine}
      avatar={
        <Link href={`/${author.handle}`}>
          <Avatar size="lg">
            {profile?.avatar && (
              <AvatarImage src={profile.avatar} alt={author.handle} />
            )}
            <AvatarFallback>{author.handle.slice(0, 2)}</AvatarFallback>
          </Avatar>
        </Link>
      }
    >
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
      <p className="text-sm wrap-break-word">{text}</p>
      <div className="flex flex-row items-center gap-1 -ml-2">
        {isLoggedIn && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={() => onReply?.(uri, cid, author.handle)}
          >
            <MessageCircleReplyIcon className="size-3.5" />
            Reply
          </Button>
        )}
        {isOwn && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => void handleDelete()}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <TrashIcon className="size-3.5" />
            )}
          </Button>
        )}
      </div>
    </CommentLayout>
  );
}

function CommentLayout({
  showThreadLine,
  avatar,
  children,
}: {
  showThreadLine?: boolean;
  avatar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-row gap-4">
      <div className="flex flex-col items-center">
        {avatar}
        {showThreadLine && <div className="w-0.5 h-full pb-12 bg-primary" />}
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}
