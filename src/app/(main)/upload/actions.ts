"use server";

import { Agent } from "@atproto/api";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export async function uploadSong(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const agent = new Agent(session);

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || undefined;
  const genre = (formData.get("genre") as string) || undefined;
  const audio = formData.get("audio") as File;
  const coverArt = formData.get("coverArt") as File;
  const duration = Number(formData.get("duration"));

  if (!title || !slug) {
    return { error: "Missing required fields." };
  }

  if (audio.size === 0) {
    return { error: "Audio file is required." };
  }

  if (coverArt.size === 0) {
    return { error: "Cover art is required." };
  }

  try {
    // Upload audio and cover art blobs in parallel
    const [{ data: audioUpload }, { data: coverArtUpload }] = await Promise.all(
      [
        agent.uploadBlob(audio, { encoding: audio.type }),
        agent.uploadBlob(coverArt, { encoding: coverArt.type }),
      ],
    );

    // Create the song record
    await agent.com.atproto.repo.createRecord({
      repo: agent.assertDid,
      collection: "app.musicsky.temp.song",
      record: {
        $type: "app.musicsky.temp.song",
        title,
        slug,
        description,
        genre,
        audio: audioUpload.blob,
        coverArt: coverArtUpload.blob,
        duration,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to upload song:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again.",
    };
  }

  redirect("/");
}
