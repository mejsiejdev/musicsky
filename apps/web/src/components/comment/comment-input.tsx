"use client";

import { startTransition, useActionState, useState } from "react";
import { Loader2Icon, MessageCirclePlusIcon, XIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import { createComment } from "./actions";

const MAX_LENGTH = 300;

export function CommentInput({
  uri,
  cid,
  songTitle,
  onClose,
  parentUri,
  parentCid,
  replyToHandle,
}: {
  uri: string;
  cid: string;
  songTitle: string;
  onClose: () => void;
  parentUri?: string;
  parentCid?: string;
  replyToHandle?: string;
}) {
  const [text, setText] = useState("");

  const [state, action, pending] = useActionState(
    async (prevState: ActionResult | null, formData: FormData) => {
      const result = await createComment(prevState, formData);
      if (result.success) {
        setText("");
        onClose();
      }
      return result;
    },
    null,
  );

  function handleSubmit() {
    if (!text.trim() || text.length > MAX_LENGTH || pending) return;

    const formData = new FormData();
    formData.set("text", text);
    formData.set("trackUri", uri);
    formData.set("trackCid", cid);

    if (parentUri && parentCid) {
      formData.set("parentUri", parentUri);
      formData.set("parentCid", parentCid);
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

  const placeholder = replyToHandle
    ? `Reply to @${replyToHandle}...`
    : `Comment on ${songTitle}...`;

  const ariaLabel = replyToHandle
    ? `Reply to @${replyToHandle}`
    : `Comment on ${songTitle}`;

  return (
    <div className="flex flex-col gap-2">
      {replyToHandle && (
        <div className="flex flex-row items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Replying to @{replyToHandle}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={onClose}
          >
            <XIcon className="size-3" />
          </Button>
        </div>
      )}
      {state && !state.success && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <div className="flex flex-row items-end gap-2">
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_LENGTH}
          placeholder={placeholder}
          aria-label={ariaLabel}
          disabled={pending}
          className="min-h-10"
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={pending || !text.trim()}
          aria-label="Submit comment"
        >
          {pending ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <MessageCirclePlusIcon />
          )}
        </Button>
      </div>
      <span className="text-xs text-muted-foreground">
        {text.length}/{MAX_LENGTH}
      </span>
    </div>
  );
}
