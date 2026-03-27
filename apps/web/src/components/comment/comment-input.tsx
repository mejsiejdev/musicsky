"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { Loader2Icon, MessageCirclePlusIcon } from "lucide-react";
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
  onCommentPosted,
}: {
  uri: string;
  cid: string;
  songTitle: string;
  onClose: () => void;
  onCommentPosted?: () => void;
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [state, action, pending] = useActionState(
    async (prevState: ActionResult | null, formData: FormData) => {
      const result = await createComment(prevState, formData);
      if (result.success) {
        setText("");
        onClose();
        onCommentPosted?.();
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

  return (
    <div className="flex flex-col gap-2">
      {state && !state.success && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <div className="flex flex-row items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_LENGTH}
          placeholder={`Comment on ${songTitle}...`}
          aria-label={`Comment on ${songTitle}`}
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
