"use client";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Field, FieldError } from "../ui/field";
import { Loader2Icon, MessageCirclePlusIcon } from "lucide-react";
import { uploadSong } from "@/components/song/upload-action";
import type { ActionResult } from "@/lib/action-result";
import { startTransition, useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";

const commentSchema = z.object({
  comment: z.string().min(1, "Comment cannot be empty"),
});

type CommentFormData = z.infer<typeof commentSchema>;

export function CommentDialog({
  children,
  songTitle,
  isLoggedIn,
}: {
  children: React.ReactNode;
  songTitle: string;
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const [state, action, pending] = useActionState(
    async (
      prevState: ActionResult<{ handle: string; rkey: string }> | null,
      formData: FormData,
    ) => {
      const result = await uploadSong(prevState, formData);
      if (result.success) {
        setOpen(false);
        reset();
        router.push(`/${result.data.handle}/${result.data.rkey}`);
      }
      return result;
    },
    null,
  );

  async function onSubmit(data: CommentFormData) {
    const formData = new FormData();
    formData.set("comment", data.comment);
    startTransition(() => {
      action(formData);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          reset();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a comment on {songTitle}</DialogTitle>
        </DialogHeader>
        {isLoggedIn ? (
          <>
            {state && !state.success && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <form
              onSubmit={(event) => void handleSubmit(onSubmit)(event)}
              className="flex flex-row items-center gap-4"
            >
              <Field data-invalid={!!errors.comment}>
                <Input
                  id="comment-title"
                  type="text"
                  placeholder="Enter your comment..."
                  {...register("comment")}
                />
                <FieldError>{errors.comment?.message}</FieldError>
              </Field>
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    Commenting...
                  </>
                ) : (
                  <MessageCirclePlusIcon />
                )}
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className="text-sm">
              You need to be logged in to leave a comment.
            </p>
            <Button onClick={() => router.push("/auth/login")}>Login</Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
