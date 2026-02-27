import { z } from "zod";

const AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/flac",
  "audio/aac",
  "audio/webm",
] as const;

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

const MAX_AUDIO_SIZE = 52_428_800; // 50 MB
const MAX_COVER_ART_SIZE = 1_000_000; // 1 MB

export const songSchema = z.object({
  title: z
    .string()
    .min(1, { error: "Title is required." })
    .max(128, { error: "Title must be 128 characters or fewer." }),
  description: z
    .string()
    .max(5000, { error: "Description must be 5000 characters or fewer." })
    .optional(),
  genre: z
    .string()
    .max(128, { error: "Genre must be 128 characters or fewer." })
    .optional(),
  audio: z
    .file({ error: "An audio file is required." })
    .mime([...AUDIO_MIME_TYPES], { error: "Must be a supported audio format." })
    .max(MAX_AUDIO_SIZE, { error: "Audio file must be 50 MB or smaller." }),
  coverArt: z
    .file()
    .mime([...IMAGE_MIME_TYPES], {
      error: "Cover art must be PNG, JPEG, or WebP.",
    })
    .max(MAX_COVER_ART_SIZE, { error: "Cover art must be 1 MB or smaller." })
    .optional(),
  duration: z
    .number()
    .int({ error: "Duration must be a whole number." })
    .min(1, { error: "Duration must be at least 1 second." }),
});

export type SongFormData = z.infer<typeof songSchema>;
