"use client";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Field, FieldLabel, FieldError, FieldDescription } from "../ui/field";
import { Loader2Icon, PencilIcon, ListMusicIcon } from "lucide-react";
import Image from "next/image";
import { editPlaylist } from "./actions";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { playlistSchema, type PlaylistFormData } from "./playlist-schema";

export function EditPlaylistDialog({
  rkey,
  name,
  description,
  coverArt,
}: {
  rkey: string;
  name: string;
  description: string | null;
  coverArt: string | null;
}) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PlaylistFormData>({
    resolver: zodResolver(playlistSchema),
    defaultValues: {
      name,
      description: description ?? undefined,
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState(coverArt);

  const previewUrlRef = useRef(previewUrl);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(
    () => () => {
      if (previewUrlRef.current && previewUrlRef.current !== coverArt) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    [coverArt],
  );

  useEffect(() => {
    if (open) {
      reset({
        name,
        description: description ?? undefined,
      });
    }
  }, [open, reset, name, description]);

  const [state, action, pending] = useActionState(
    async (
      prevState: { success?: boolean; error?: string } | null,
      formData: FormData,
    ) => {
      const result = await editPlaylist(prevState, formData);
      if (result.success) {
        setOpen(false);
      }
      return result;
    },
    null,
  );

  async function onSubmit(data: PlaylistFormData) {
    const formData = new FormData();
    formData.set("rkey", rkey);
    formData.set("name", data.name);
    formData.set("description", data.description ?? "");
    if (data.coverArt) {
      formData.set("coverArt", data.coverArt);
    }
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
          setPreviewUrl((prev) => {
            if (prev && prev !== coverArt) URL.revokeObjectURL(prev);
            return coverArt;
          });
          setValue("coverArt", undefined);
        }
      }}
    >
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          <PencilIcon />
          Edit
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit playlist</DialogTitle>
        </DialogHeader>
        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={!!errors.coverArt} className="w-auto">
            <FieldLabel>Cover art</FieldLabel>
            <FieldDescription>
              PNG, JPEG, or WebP. Max 10 MB. Optional.
            </FieldDescription>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change cover art"
              className="group relative aspect-square max-w-48 overflow-hidden rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Current cover art"
                  className="size-full object-cover"
                  width={500}
                  height={500}
                  unoptimized={previewUrl !== coverArt}
                />
              ) : (
                <div className="size-full bg-muted flex items-center justify-center">
                  <ListMusicIcon className="size-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/50 group-focus-visible:bg-black/50">
                <PencilIcon className="size-8 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              tabIndex={-1}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setValue("coverArt", file, { shouldValidate: true });
                  setPreviewUrl((prev) => {
                    if (prev && prev !== coverArt) URL.revokeObjectURL(prev);
                    return URL.createObjectURL(file);
                  });
                }
              }}
            />
            <FieldError>{errors.coverArt?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="edit-playlist-name">Name</FieldLabel>
            <Input id="edit-playlist-name" {...register("name")} />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="edit-playlist-description">
              Description
            </FieldLabel>
            <Textarea
              id="edit-playlist-description"
              {...register("description")}
            />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
