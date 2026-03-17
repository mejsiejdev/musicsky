import { z } from "zod";

export const playlistSchema = z.object({
  name: z
    .string()
    .min(1, { error: "Name is required." })
    .max(512, { error: "Name must be 512 characters or fewer." }),
  description: z
    .string()
    .max(5000, { error: "Description must be 5000 characters or fewer." })
    .optional(),
  coverArt: z
    .file({ error: "Cover art must be a file." })
    .mime(["image/png", "image/jpeg", "image/webp"], {
      error: "Cover art must be PNG, JPEG, or WebP.",
    })
    .max(10_000_000, { error: "Cover art must be 10 MB or smaller." })
    .optional(),
});

export type PlaylistFormData = z.infer<typeof playlistSchema>;
