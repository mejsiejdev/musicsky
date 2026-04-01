"use client";

import { startTransition, useActionState, useState } from "react";
import Image from "next/image";
import { Loader2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import { CommentLayout } from "./comment-layout";
import { createComment } from "./actions";

const MAX_LENGTH = 300;

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
  authorDisplayName?: string;
  authorAvatar?: string;
  description?: string | null;
}

export function CommentDialog({
  open,
  onOpenChange,
  trackUri,
  trackCid,
  userAvatar,
  userHandle,
  parentComment,
  song,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackUri: string;
  trackCid: string;
  userAvatar?: string;
  userHandle?: string;
  parentComment?: ParentComment;
  song?: SongContext;
  onSuccess?: () => void;
}) {
  const [text, setText] = useState("");

  const [state, action, pending] = useActionState(
    async (prevState: ActionResult | null, formData: FormData) => {
      const result = await createComment(prevState, formData);
      if (result.success) {
        setText("");
        onOpenChange(false);
        onSuccess?.();
      }
      return result;
    },
    null,
  );

  function handleSubmit() {
    if (!text.trim() || text.length > MAX_LENGTH || pending) return;

    const formData = new FormData();
    formData.set("text", text);
    formData.set("trackUri", trackUri);
    formData.set("trackCid", trackCid);

    if (parentComment) {
      formData.set("parentUri", parentComment.uri);
      formData.set("parentCid", parentComment.cid);
    }

    startTransition(() => {
      action(formData);
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  const isReply = !!parentComment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-lg">
        <div className="flex flex-row items-center justify-between px-4 py-3">
          <DialogClose asChild>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <DialogTitle className="sr-only">
            {isReply ? "Reply to comment" : "Add a comment"}
          </DialogTitle>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={pending || !text.trim()}
          >
            {pending && <Loader2Icon className="size-4 animate-spin" />}
            {!pending && (isReply ? "Reply" : "Comment")}
          </Button>
        </div>

        <div className="border-t" />

        <div className="px-4 py-3">
          {song && !isReply && (
            <CommentLayout
              showThreadLine
              avatar={
                <Avatar size="lg">
                  {song.authorAvatar && (
                    <AvatarImage src={song.authorAvatar} alt={song.author} />
                  )}
                  <AvatarFallback>{song.author.slice(0, 2)}</AvatarFallback>
                </Avatar>
              }
            >
              <div className="flex flex-row items-center gap-2">
                {song.authorDisplayName && (
                  <span className="text-sm font-medium">
                    {song.authorDisplayName}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  @{song.author}
                </span>
              </div>
              <div className="flex flex-row items-center gap-3">
                <Image
                  className="rounded-md size-14"
                  src={song.coverArt}
                  alt={song.title}
                  width={56}
                  height={56}
                  unoptimized={
                    song.coverArt.startsWith("http://127.0.0.1") ||
                    song.coverArt.startsWith("http://localhost")
                  }
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{song.title}</span>
                  {song.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {song.description}
                    </p>
                  )}
                </div>
              </div>
            </CommentLayout>
          )}

          {isReply && (
            <CommentLayout
              showThreadLine
              avatar={
                <Avatar size="lg">
                  {parentComment.authorAvatar && (
                    <AvatarImage
                      src={parentComment.authorAvatar}
                      alt={parentComment.authorHandle}
                    />
                  )}
                  <AvatarFallback>
                    {parentComment.authorHandle.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              }
            >
              <div className="flex flex-row items-center gap-2">
                {parentComment.authorDisplayName && (
                  <span className="text-sm font-medium">
                    {parentComment.authorDisplayName}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  @{parentComment.authorHandle}
                </span>
              </div>
              <p className="text-sm text-muted-foreground wrap-break-word">
                {parentComment.text}
              </p>
            </CommentLayout>
          )}

          <CommentLayout
            avatar={
              <Avatar size="lg">
                {userAvatar && (
                  <AvatarImage src={userAvatar} alt={userHandle ?? "You"} />
                )}
                <AvatarFallback>
                  {userHandle?.slice(0, 2) ?? "?"}
                </AvatarFallback>
              </Avatar>
            }
          >
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={MAX_LENGTH}
              placeholder="Write your reply"
              aria-label={isReply ? "Reply to comment" : "Add a comment"}
              disabled={pending}
              className="min-h-20 resize-none border-0 shadow-none focus-visible:ring-0"
              autoFocus
            />
          </CommentLayout>
        </div>

        {state && !state.success && (
          <p className="px-4 pb-2 text-sm text-destructive">{state.error}</p>
        )}

        <div className="border-t" />
        <div className="flex flex-row items-center justify-end px-4 py-2">
          <span className="text-xs text-muted-foreground">
            {text.length}/{MAX_LENGTH}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
