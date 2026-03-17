"use server";

import { Agent } from "@atproto/api";
import { updateTag } from "next/cache";
import { playlistSchema } from "./playlist-schema";
import type { PlaylistRecord } from "@/types/playlist";
import { getHandleFromDid } from "@/lib/songs";
import { COLLECTIONS, getRkeyFromUri } from "@/lib/atproto";
import { type ActionResult, ok, fail } from "@/lib/action-result";
import { requireSession } from "@/lib/repo";

export async function createPlaylist(
  _prevState: ActionResult<{ rkey: string; handle: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ rkey: string; handle: string }>> {
  const coverArtFile = formData.get("coverArt") as File | null;
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    coverArt: coverArtFile && coverArtFile.size > 0 ? coverArtFile : undefined,
  };

  const parsed = playlistSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(new Error(parsed.error.issues[0]?.message ?? "Invalid input."));
  }

  const trackUri = formData.get("trackUri") as string;
  const trackCid = formData.get("trackCid") as string;
  if (!trackUri || !trackCid) {
    return fail(new Error("A playlist must have at least one track."));
  }

  const session = await requireSession();
  const agent = new Agent(session);
  const did = agent.assertDid;

  try {
    let coverArt;
    if (parsed.data.coverArt) {
      const { data: coverArtUpload } = await agent.uploadBlob(
        parsed.data.coverArt,
        { encoding: parsed.data.coverArt.type },
      );
      coverArt = coverArtUpload.blob;
    }

    const { data } = await agent.com.atproto.repo.createRecord({
      repo: did,
      collection: COLLECTIONS.playlist,
      record: {
        $type: COLLECTIONS.playlist,
        name: parsed.data.name,
        description: parsed.data.description,
        coverArt,
        tracks: [{ uri: trackUri, cid: trackCid }],
        createdAt: new Date().toISOString(),
      },
    });

    const rkey = getRkeyFromUri(data.uri);
    const handle = await getHandleFromDid(did);
    updateTag(`playlists-${did}`);
    return ok({ rkey, handle });
  } catch (error) {
    console.error("Failed to create playlist:", error);
    return fail(error);
  }
}

export async function editPlaylist(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const rkey = formData.get("rkey") as string;
  const coverArtFile = formData.get("coverArt") as File | null;
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    coverArt: coverArtFile && coverArtFile.size > 0 ? coverArtFile : undefined,
  };

  const parsed = playlistSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(new Error(parsed.error.issues[0]?.message ?? "Invalid input."));
  }

  const session = await requireSession();
  const agent = new Agent(session);
  const did = agent.assertDid;

  try {
    const { data: existing } = await agent.com.atproto.repo.getRecord({
      repo: did,
      collection: COLLECTIONS.playlist,
      rkey,
    });

    const existingValue = existing.value as unknown as PlaylistRecord;

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
      collection: COLLECTIONS.playlist,
      rkey,
      swapRecord: existing.cid,
      record: {
        ...existingValue,
        name: parsed.data.name,
        description: parsed.data.description,
        coverArt,
        updatedAt: new Date().toISOString(),
      },
    });

    updateTag(`playlist-${did}-${rkey}`);
    updateTag(`playlists-${did}`);
    return ok();
  } catch (error) {
    console.error("Failed to edit playlist:", error);
    return fail(error);
  }
}

export async function deletePlaylist(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const rkey = formData.get("rkey") as string;
  const session = await requireSession();
  const agent = new Agent(session);
  try {
    await agent.com.atproto.repo.deleteRecord({
      repo: agent.assertDid,
      collection: COLLECTIONS.playlist,
      rkey,
    });
    updateTag(`playlist-${agent.assertDid}-${rkey}`);
    updateTag(`playlists-${agent.assertDid}`);
    return ok();
  } catch (error) {
    console.error("Failed to delete playlist:", error);
    return fail(error);
  }
}

export async function addTrackToPlaylist(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const rkey = formData.get("rkey") as string;
  const trackUri = formData.get("trackUri") as string;
  const trackCid = formData.get("trackCid") as string;

  if (!trackUri || !trackCid) {
    return fail(new Error("Missing track information."));
  }

  const session = await requireSession();
  const agent = new Agent(session);
  const did = agent.assertDid;

  try {
    const { data: existing } = await agent.com.atproto.repo.getRecord({
      repo: did,
      collection: COLLECTIONS.playlist,
      rkey,
    });

    const existingValue = existing.value as unknown as PlaylistRecord;

    if (existingValue.tracks.length >= 500) {
      return fail(new Error("Playlist cannot have more than 500 tracks."));
    }

    if (existingValue.tracks.some((track) => track.uri === trackUri)) {
      return fail(new Error("Track is already in this playlist."));
    }

    await agent.com.atproto.repo.putRecord({
      repo: did,
      collection: COLLECTIONS.playlist,
      rkey,
      swapRecord: existing.cid,
      record: {
        ...existingValue,
        tracks: [...existingValue.tracks, { uri: trackUri, cid: trackCid }],
        updatedAt: new Date().toISOString(),
      },
    });

    updateTag(`playlist-${did}-${rkey}`);
    updateTag(`playlists-${did}`);
    return ok();
  } catch (error) {
    console.error("Failed to add track to playlist:", error);
    return fail(error);
  }
}

export async function removeTrackFromPlaylist(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const rkey = formData.get("rkey") as string;
  const trackUri = formData.get("trackUri") as string;

  const session = await requireSession();
  const agent = new Agent(session);
  const did = agent.assertDid;

  try {
    const { data: existing } = await agent.com.atproto.repo.getRecord({
      repo: did,
      collection: COLLECTIONS.playlist,
      rkey,
    });

    const existingValue = existing.value as unknown as PlaylistRecord;
    const filtered = existingValue.tracks.filter(
      (track) => track.uri !== trackUri,
    );

    if (filtered.length === 0) {
      return fail(
        new Error("Cannot remove the last track. Delete the playlist instead."),
      );
    }

    await agent.com.atproto.repo.putRecord({
      repo: did,
      collection: COLLECTIONS.playlist,
      rkey,
      swapRecord: existing.cid,
      record: {
        ...existingValue,
        tracks: filtered,
        updatedAt: new Date().toISOString(),
      },
    });

    updateTag(`playlist-${did}-${rkey}`);
    updateTag(`playlists-${did}`);
    return ok();
  } catch (error) {
    console.error("Failed to remove track from playlist:", error);
    return fail(error);
  }
}

export async function getUserPlaylistsAction() {
  const { getSession } = await import("@/lib/auth/session");
  const session = await getSession();
  if (!session) return [];
  const agent = new Agent(session);
  const did = agent.assertDid;

  try {
    const { data } = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: COLLECTIONS.playlist,
      limit: 50,
    });

    return data.records.map((record) => {
      const value = record.value as unknown as PlaylistRecord;
      return {
        rkey: getRkeyFromUri(record.uri),
        name: value.name,
      };
    });
  } catch (error) {
    console.error("Failed to fetch user playlists:", error);
    return [];
  }
}
