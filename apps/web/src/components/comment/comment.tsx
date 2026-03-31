"use client";

import { useState, useOptimistic, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { formatDistanceToNow, format } from "date-fns";
import { HeartIcon, TrashIcon, Loader2Icon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { CommentLayout } from "./comment-layout";
import { CommentButton } from "./comment-button";
import {
  deleteComment,
  likeCommentAction,
  unlikeCommentAction,
} from "./actions";

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
  trackCid,
  showThreadLine,
  href,
  replyCount,
  likeCount,
  likeRkey,
  userAvatar,
  userHandle,
  songHandle,
  songRkey,
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
  trackCid?: string;
  showThreadLine?: boolean;
  href?: string;
  replyCount?: number;
  likeCount?: number;
  likeRkey?: string | null;
  userAvatar?: string;
  userHandle?: string;
  songHandle?: string;
  songRkey?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(!!likeRkey);
  const [optimisticLikeCount, setOptimisticLikeCount] = useOptimistic(
    likeCount ?? 0,
  );
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

  function handleLike() {
    startTransition(async () => {
      if (optimisticLiked) {
        setOptimisticLiked(false);
        setOptimisticLikeCount(optimisticLikeCount - 1);
        if (likeRkey) await unlikeCommentAction(likeRkey, trackUri);
      } else {
        setOptimisticLiked(true);
        setOptimisticLikeCount(optimisticLikeCount + 1);
        await likeCommentAction(uri, cid, trackUri);
      }
    });
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
        <p className="text-sm text-muted-foreground italic min-h-10 flex items-center">
          [deleted]
        </p>
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
      <div
        className={href ? "cursor-pointer" : undefined}
        onClick={() => href && router.push(href)}
      >
        <div className="flex flex-row items-center gap-2">
          <Link
            href={`/${author.handle}`}
            className="text-sm font-medium hover:underline truncate"
            onClick={(event) => event.stopPropagation()}
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
      </div>
      <div className="flex flex-row items-center max-w-xs -ml-2">
        <div className="flex-1">
          <CommentButton
            size="action-sm"
            trackUri={trackUri}
            trackCid={trackCid}
            isLoggedIn={isLoggedIn}
            userAvatar={userAvatar}
            userHandle={userHandle}
            replyCount={replyCount}
            parentComment={{
              uri,
              cid,
              text,
              authorHandle: author.handle,
              authorAvatar: profile?.avatar,
              authorDisplayName: profile?.displayName,
            }}
            onSuccess={() => {
              const commentRkey = uri.split("/")[4]!;
              if (songHandle && songRkey) {
                router.push(`/${songHandle}/${songRkey}/${commentRkey}`);
              }
            }}
          />
        </div>
        <div className="flex-1">
          <Button variant="ghost" size="action-sm" onClick={handleLike}>
            <HeartIcon
              className={optimisticLiked ? "text-red-500" : undefined}
              fill={optimisticLiked ? "currentColor" : "none"}
            />
            {optimisticLikeCount > 0 && optimisticLikeCount}
          </Button>
        </div>
        <div className="flex-1">
          {isOwn ? (
            <Button
              variant="ghost"
              size="action-sm"
              className="hover:text-destructive"
              onClick={() => void handleDelete()}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <TrashIcon />
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </CommentLayout>
  );
}
