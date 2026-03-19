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
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Field, FieldLabel, FieldDescription, FieldError } from "../ui/field";
import { Loader2Icon } from "lucide-react";
import { uploadSong } from "@/components/song/upload-action";
import type { ActionResult } from "@/lib/action-result";
import { startTransition, useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadSongSchema, type UploadSongFormData } from "./upload-schema";
import { useRouter } from "next/navigation";

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.addEventListener("loadedmetadata", () => {
      const duration = Math.round(audio.duration);
      URL.revokeObjectURL(audio.src);
      resolve(duration);
    });
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(audio.src);
      reject(new Error("Could not read audio file."));
    });
    audio.src = URL.createObjectURL(file);
  });
}

export function UploadDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<UploadSongFormData>({
    resolver: zodResolver(uploadSongSchema),
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

  async function onAudioChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setValue("audio", file, { shouldValidate: true });

    try {
      const duration = await getAudioDuration(file);
      setValue("duration", duration, { shouldValidate: true });
    } catch {
      setError("audio", { message: "Could not read audio duration." });
    }
  }

  async function onSubmit(data: UploadSongFormData) {
    const formData = new FormData();
    formData.set("title", data.title);
    if (data.description) formData.set("description", data.description);
    if (data.genre) formData.set("genre", data.genre);
    formData.set("audio", data.audio);
    formData.set("coverArt", data.coverArt);
    formData.set("duration", String(data.duration));
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
      <DialogTrigger asChild>
        <Button>Upload a song</Button>
      </DialogTrigger>
      <DialogContent onInteractOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Upload a song</DialogTitle>
        </DialogHeader>
        {state && !state.success && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        <form
          onSubmit={(event) => void handleSubmit(onSubmit)(event)}
          className="space-y-4"
        >
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="upload-title">Title</FieldLabel>
            <Input
              id="upload-title"
              placeholder="Enter the title of your song"
              {...register("title")}
            />
            <FieldError>{errors.title?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.genre}>
            <FieldLabel htmlFor="upload-genre">Genre</FieldLabel>
            <Input
              id="upload-genre"
              placeholder="Electronic, Hip-Hop, Jazz..."
              {...register("genre")}
            />
            <FieldError>{errors.genre?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="upload-description">Description</FieldLabel>
            <Textarea
              id="upload-description"
              placeholder="Tell listeners about this song..."
              {...register("description")}
            />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.audio}>
            <FieldLabel htmlFor="upload-audio">Audio file</FieldLabel>
            <FieldDescription>
              MP3, OGG, WAV, FLAC, AAC, or WebM. Max 50 MB.
            </FieldDescription>
            <Input
              id="upload-audio"
              type="file"
              accept="audio/mpeg,audio/ogg,audio/wav,audio/flac,audio/aac,audio/webm"
              onChange={(event) => void onAudioChange(event)}
            />
            <FieldError>{errors.audio?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.coverArt}>
            <FieldLabel htmlFor="upload-coverArt">Cover art</FieldLabel>
            <FieldDescription>PNG, JPEG, or WebP. Max 10 MB.</FieldDescription>
            <Input
              id="upload-coverArt"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setValue("coverArt", file, { shouldValidate: true });
              }}
            />
            <FieldError>{errors.coverArt?.message}</FieldError>
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
