"use server";

import { Agent } from "@atproto/api";
import { updateTag } from "next/cache";
import { editSongSchema } from "./edit-schema";
import type { TrackRecord } from "@/types/song";
import { COLLECTIONS } from "@/lib/atproto";
import { type ActionResult, ok, fail } from "@/lib/action-result";
import { requireSession } from "@/lib/repo";

export async function editSong(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
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
    return fail(new Error(parsed.error.issues[0]?.message ?? "Invalid input."));
  }

  const session = await requireSession();
  const agent = new Agent(session);
  const did = agent.assertDid;

  try {
    const { data: existing } = await agent.com.atproto.repo.getRecord({
      repo: did,
      collection: COLLECTIONS.song,
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
      collection: COLLECTIONS.song,
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
    return ok();
  } catch (error) {
    console.error("Failed to edit song:", error);
    return fail(error);
  }
}

export async function deleteSong(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const rkey = formData.get("rkey") as string;
  const session = await requireSession();
  const agent = new Agent(session);
  try {
    await agent.com.atproto.repo.deleteRecord({
      repo: agent.assertDid,
      collection: COLLECTIONS.song,
      rkey,
    });
    updateTag(`songs-${agent.assertDid}`);
    return ok();
  } catch (error) {
    console.error("Failed to delete song:", error);
    return fail(error);
  }
}
