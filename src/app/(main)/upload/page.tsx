"use client";

import { useForm } from "react-hook-form";
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
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SongFormData>({
    resolver: zodResolver(songSchema),
  });

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
    if (data.description) formData.set("description", data.description);
    if (data.genre) formData.set("genre", data.genre);
    formData.set("audio", data.audio);
    if (data.coverArt) formData.set("coverArt", data.coverArt);
    formData.set("duration", String(data.duration));

    const result = await uploadSong(formData);
    if (result?.error) {
      setError("root", { message: result.error });
    }
  }

  return (
    <fieldset disabled={isSubmitting}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            onChange={onAudioChange}
          />
          <FieldError>{errors.audio?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.coverArt}>
          <FieldLabel htmlFor="coverArt">Cover art</FieldLabel>
          <FieldDescription>
            PNG, JPEG, or WebP. Max 1 MB. Optional.
          </FieldDescription>
          <Input
            id="coverArt"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setValue("coverArt", file, { shouldValidate: true });
            }}
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
