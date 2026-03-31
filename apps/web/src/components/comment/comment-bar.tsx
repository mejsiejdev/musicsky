"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CommentDialog } from "./comment-dialog";

export function CommentBar({
  trackUri,
  trackCid,
  userAvatar,
  userHandle,
  songTitle,
  songCoverArt,
  songAuthor,
  songAuthorDisplayName,
  songAuthorAvatar,
  songDescription,
}: {
  trackUri: string;
  trackCid: string;
  userAvatar?: string;
  userHandle?: string;
  songTitle: string;
  songCoverArt: string;
  songAuthor: string;
  songAuthorDisplayName?: string;
  songAuthorAvatar?: string;
  songDescription?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full cursor-pointer flex-row items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-accent"
      >
        <Avatar>
          {userAvatar && (
            <AvatarImage src={userAvatar} alt={userHandle ?? "You"} />
          )}
          <AvatarFallback>{userHandle?.slice(0, 2) ?? "?"}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground">Write your reply</span>
      </button>

      <CommentDialog
        open={open}
        onOpenChange={setOpen}
        trackUri={trackUri}
        trackCid={trackCid}
        userAvatar={userAvatar}
        userHandle={userHandle}
        song={{
          title: songTitle,
          coverArt: songCoverArt,
          author: songAuthor,
          authorDisplayName: songAuthorDisplayName,
          authorAvatar: songAuthorAvatar,
          description: songDescription,
        }}
      />
    </>
  );
}
