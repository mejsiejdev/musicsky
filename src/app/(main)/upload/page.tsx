"use client";

import { useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { songSchema, type SongFormData } from "./song-schema";
import { uploadSong } from "./actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

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

export default function SongUploadForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SongFormData>({
    resolver: zodResolver(songSchema),
  });

  const slugManuallyEdited = useRef(false);
  const title = watch("title");

  useEffect(() => {
    if (!slugManuallyEdited.current) {
      setValue("slug", toSlug(title), { shouldValidate: false });
    }
  }, [title, setValue]);

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

  async function onSubmit(data: SongFormData) {
    const formData = new FormData();
    formData.set("title", data.title);
    formData.set("slug", data.slug);
    if (data.description) formData.set("description", data.description);
    if (data.genre) formData.set("genre", data.genre);
    formData.set("audio", data.audio);
    formData.set("coverArt", data.coverArt);
    formData.set("duration", String(data.duration));

    const result = await uploadSong(formData);
    if (result.error) {
      setError("root", { message: result.error });
    }
  }

  return (
    <fieldset disabled={isSubmitting}>
      <form
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        className="space-y-6"
      >
        {errors.root && <FieldError>{errors.root.message}</FieldError>}

        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            placeholder="Enter the title of your song"
            {...register("title")}
          />
          <FieldError>{errors.title?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.slug}>
          <FieldLabel htmlFor="slug">Slug</FieldLabel>
          <FieldDescription>
            Used in the song&apos;s URL. Lowercase letters, numbers, and hyphens
            only.
          </FieldDescription>
          <Input
            id="slug"
            placeholder="my-song-title"
            {...register("slug", {
              onChange: () => {
                slugManuallyEdited.current = true;
              },
            })}
          />
          <FieldError>{errors.slug?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            placeholder="Tell listeners about this song..."
            {...register("description")}
          />
          <FieldError>{errors.description?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.genre}>
          <FieldLabel htmlFor="genre">Genre</FieldLabel>
          <Input
            id="genre"
            placeholder="Electronic, Hip-Hop, Jazz..."
            {...register("genre")}
          />
          <FieldError>{errors.genre?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.audio}>
          <FieldLabel htmlFor="audio">Audio file</FieldLabel>
          <FieldDescription>
            MP3, OGG, WAV, FLAC, AAC, or WebM. Max 50 MB.
          </FieldDescription>
          <Input
            id="audio"
            type="file"
            accept="audio/mpeg,audio/ogg,audio/wav,audio/flac,audio/aac,audio/webm"
            onChange={(event) => void onAudioChange(event)}
          />
          <FieldError>{errors.audio?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.coverArt}>
          <FieldLabel htmlFor="coverArt">Cover art</FieldLabel>
          <FieldDescription>PNG, JPEG, or WebP. Max 10 MB.</FieldDescription>
          <Input
            id="coverArt"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setValue("coverArt", file, { shouldValidate: true });
            }}
            required
          />
          <FieldError>{errors.coverArt?.message}</FieldError>
        </Field>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? "Uploading..." : "Upload song"}
        </Button>
      </form>
    </fieldset>
  );
}
