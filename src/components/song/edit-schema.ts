import { z } from "zod";
import { songSchema } from "@/app/(main)/upload/song-schema";

export const editSongSchema = songSchema
  .pick({
    title: true,
    description: true,
    genre: true,
  })
  .extend({
    coverArt: z
      .file({ error: "Cover art must be a file." })
      .mime(["image/png", "image/jpeg", "image/webp"], {
        error: "Cover art must be PNG, JPEG, or WebP.",
      })
      .max(10_000_000, { error: "Cover art must be 10 MB or smaller." })
      .optional(),
  });

export type EditSongFormData = z.infer<typeof editSongSchema>;
