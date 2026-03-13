import type { z } from "zod";
import { songSchema } from "@/app/(main)/upload/song-schema";

export const editSongSchema = songSchema.pick({
  title: true,
  description: true,
  genre: true,
});

export type EditSongFormData = z.infer<typeof editSongSchema>;
