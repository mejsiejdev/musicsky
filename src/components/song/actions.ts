"use server";

import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Agent } from "@atproto/api";
import { updateTag } from "next/cache";
import { editSongSchema } from "./edit-schema";
import type { TrackRecord } from "@/types/song";

export async function editSong(
  _prevState: { success?: boolean; error?: string } | null,
  formData: FormData,
) {
  const rkey = formData.get("rkey") as string;
  const coverArtFile = formData.get("coverArt") as File | null;
  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) ?? undefined,
    genre: (formData.get("genre") as string) ?? undefined,
    coverArt: coverArtFile && coverArtFile.size > 0 ? coverArtFile : undefined,
  };

  const parsed = editSongSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const agent = new Agent(session);
  const did = agent.assertDid;

  try {
    const { data: existing } = await agent.com.atproto.repo.getRecord({
      repo: did,
      collection: "app.musicsky.temp.song",
      rkey,
    });

    const existingValue = existing.value as unknown as TrackRecord;

    let coverArt = existingValue.coverArt;
    if (parsed.data.coverArt) {
      const { data: coverArtUpload } = await agent.uploadBlob(
        parsed.data.coverArt,
        { encoding: parsed.data.coverArt.type },
      );
      coverArt = coverArtUpload.blob;
    }

    await agent.com.atproto.repo.putRecord({
      repo: did,
      collection: "app.musicsky.temp.song",
      rkey,
      record: {
        ...existingValue,
        title: parsed.data.title,
        description: parsed.data.description || undefined,
        genre: parsed.data.genre || undefined,
        coverArt,
      },
    });

    updateTag(`song-${did}-${rkey}`);
    updateTag(`songs-${did}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to edit song:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again.",
    };
  }
}

export async function deleteSong(
  _prevState: { success?: boolean; error?: string } | null,
  formData: FormData,
) {
  const rkey = formData.get("rkey") as string;
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }
  const agent = new Agent(session);
  try {
    await agent.com.atproto.repo.deleteRecord({
      repo: agent.assertDid,
      collection: "app.musicsky.temp.song",
      rkey,
    });
    updateTag(`songs-${agent.assertDid}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete song:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again.",
    };
  }
}
