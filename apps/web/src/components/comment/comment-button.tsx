"use client";

import { Activity, useState } from "react";
import dynamic from "next/dynamic";
import { MessageCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const LazyCommentDialog = dynamic(() =>
  import("./comment-dialog").then((mod) => ({ default: mod.CommentDialog })),
);

interface ParentComment {
  uri: string;
  cid: string;
  text: string;
  authorHandle: string;
  authorAvatar?: string;
  authorDisplayName?: string;
}

interface SongContext {
  title: string;
  coverArt: string;
  author: string;
  authorAvatar?: string;
  description?: string | null;
}

export function CommentButton({
  size,
  trackUri,
  trackCid,
  isLoggedIn,
  userAvatar,
  userHandle,
  replyCount,
  parentComment,
  song,
  href,
  onSuccess,
}: {
  size: "action" | "action-sm";
  trackUri: string;
  trackCid?: string;
  isLoggedIn?: boolean;
  userAvatar?: string;
  userHandle?: string;
  replyCount?: number;
  parentComment?: ParentComment;
  song?: SongContext;
  href?: string;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const canOpenDialog = isLoggedIn && !!trackCid && !!userHandle;

  const buttonContent = (
    <>
      <MessageCircleIcon />
      {replyCount !== undefined && (
        <Activity mode={replyCount > 0 ? "visible" : "hidden"}>
          {replyCount}
        </Activity>
      )}
    </>
  );

  if (!canOpenDialog && href) {
    return (
      <Button variant="ghost" size={size} asChild>
        <a href={href} aria-label="Comment">
          {buttonContent}
        </a>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size={size}
        onClick={() => canOpenDialog && setOpen(true)}
        aria-label={parentComment ? "Reply" : "Comment"}
      >
        {buttonContent}
      </Button>
      {open && trackCid && (
        <LazyCommentDialog
          open={open}
          onOpenChange={setOpen}
          trackUri={trackUri}
          trackCid={trackCid}
          userAvatar={userAvatar}
          userHandle={userHandle}
          parentComment={parentComment}
          song={song}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}
