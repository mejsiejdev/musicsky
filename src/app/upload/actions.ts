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
  const description = (formData.get("description") as string) || undefined;
  const genre = (formData.get("genre") as string) || undefined;
  const audio = formData.get("audio") as File;
  const coverArt = formData.get("coverArt") as File | null;
  const duration = Number(formData.get("duration"));

  if (!audio || !title || !duration) {
    return { error: "Missing required fields." };
  }

  try {
    // Upload audio blob
    const { data: audioUpload } = await agent.uploadBlob(audio, {
      encoding: audio.type,
    });

    // Upload cover art blob (if provided)
    const coverArtBlob =
      coverArt && coverArt.size > 0
        ? (await agent.uploadBlob(coverArt, { encoding: coverArt.type })).data
            .blob
        : undefined;

    // Create the track record
    await agent.com.atproto.repo.createRecord({
      repo: agent.assertDid,
      collection: "app.musicsky.temp.track",
      record: {
        $type: "app.musicsky.temp.track",
        title,
        description,
        genre,
        audio: audioUpload.blob,
        coverArt: coverArtBlob,
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
