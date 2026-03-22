"use server";

import { Agent } from "@atproto/api";
import { type ActionResult, ok, fail } from "@/lib/action-result";
import { requireSession } from "@/lib/repo";
import { COLLECTIONS } from "@/lib/atproto";

export async function uploadSong(
  _prevState: ActionResult<{ handle: string; rkey: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ handle: string; rkey: string }>> {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || undefined;
  const genre = (formData.get("genre") as string) || undefined;
  const audio = formData.get("audio") as File;
  const coverArt = formData.get("coverArt") as File;
  const duration = Number(formData.get("duration"));

  if (!title) {
    return fail(new Error("Title is required."));
  }

  if (audio.size === 0) {
    return fail(new Error("Audio file is required."));
  }

  if (coverArt.size === 0) {
    return fail(new Error("Cover art is required."));
  }

  const session = await requireSession();
  const agent = new Agent(session);

  try {
    const { data: audioUpload } = await agent.uploadBlob(audio, {
      encoding: audio.type,
    });
    const { data: coverArtUpload } = await agent.uploadBlob(coverArt, {
      encoding: coverArt.type,
    });

    const { data: record } = await agent.com.atproto.repo.createRecord({
      repo: agent.assertDid,
      collection: COLLECTIONS.song,
      record: {
        $type: COLLECTIONS.song,
        title,
        description,
        genre,
        audio: audioUpload.blob,
        coverArt: coverArtUpload.blob,
        duration,
        createdAt: new Date().toISOString(),
      },
    });

    const rkey = record.uri.split("/").pop()!;
    const { data: repo } = await agent.com.atproto.repo.describeRepo({
      repo: agent.assertDid,
    });

    return ok({ handle: repo.handle, rkey });
  } catch (error) {
    console.error("Failed to upload song:", error);
    return fail(error);
  }
}
