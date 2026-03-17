"use server";

import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Agent } from "@atproto/api";
import { updateTag } from "next/cache";
import { playlistSchema } from "./playlist-schema";
import type { PlaylistRecord } from "@/types/playlist";
import { getHandleFromDid } from "@/lib/songs";
const COLLECTION = "app.musicsky.temp.playlist";

export async function createPlaylist(
  _prevState: { success?: boolean; error?: string; rkey?: string } | null,
  formData: FormData,
) {
  const coverArtFile = formData.get("coverArt") as File | null;
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    coverArt: coverArtFile && coverArtFile.size > 0 ? coverArtFile : undefined,
  };

  const parsed = playlistSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const trackUri = formData.get("trackUri") as string;
  const trackCid = formData.get("trackCid") as string;
  if (!trackUri || !trackCid) {
    return { error: "A playlist must have at least one track." };
  }

  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }

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
      collection: COLLECTION,
      record: {
        $type: COLLECTION,
        name: parsed.data.name,
        description: parsed.data.description,
        coverArt,
        tracks: [{ uri: trackUri, cid: trackCid }],
        createdAt: new Date().toISOString(),
      },
    });

    const rkey = data.uri.split("/")[4]!;
    const handle = await getHandleFromDid(did);
    updateTag(`playlists-${did}`);
    return { success: true, rkey, handle };
  } catch (error) {
    console.error("Failed to create playlist:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again.",
    };
  }
}

export async function editPlaylist(
  _prevState: { success?: boolean; error?: string } | null,
  formData: FormData,
) {
  const rkey = formData.get("rkey") as string;
  const coverArtFile = formData.get("coverArt") as File | null;
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    coverArt: coverArtFile && coverArtFile.size > 0 ? coverArtFile : undefined,
  };

  const parsed = playlistSchema.safeParse(raw);
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
      collection: COLLECTION,
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
      collection: COLLECTION,
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
    return { success: true };
  } catch (error) {
    console.error("Failed to edit playlist:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again.",
    };
  }
}

export async function deletePlaylist(
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
      collection: COLLECTION,
      rkey,
    });
    updateTag(`playlist-${agent.assertDid}-${rkey}`);
    updateTag(`playlists-${agent.assertDid}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete playlist:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again.",
    };
  }
}

export async function addTrackToPlaylist(
  _prevState: { success?: boolean; error?: string } | null,
  formData: FormData,
) {
  const rkey = formData.get("rkey") as string;
  const trackUri = formData.get("trackUri") as string;
  const trackCid = formData.get("trackCid") as string;

  if (!trackUri || !trackCid) {
    return { error: "Missing track information." };
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
      collection: COLLECTION,
      rkey,
    });

    const existingValue = existing.value as unknown as PlaylistRecord;

    if (existingValue.tracks.length >= 500) {
      return { error: "Playlist cannot have more than 500 tracks." };
    }

    if (existingValue.tracks.some((track) => track.uri === trackUri)) {
      return { error: "Track is already in this playlist." };
    }

    await agent.com.atproto.repo.putRecord({
      repo: did,
      collection: COLLECTION,
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
    return { success: true };
  } catch (error) {
    console.error("Failed to add track to playlist:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again.",
    };
  }
}

export async function removeTrackFromPlaylist(
  _prevState: { success?: boolean; error?: string } | null,
  formData: FormData,
) {
  const rkey = formData.get("rkey") as string;
  const trackUri = formData.get("trackUri") as string;

  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const agent = new Agent(session);
  const did = agent.assertDid;

  try {
    const { data: existing } = await agent.com.atproto.repo.getRecord({
      repo: did,
      collection: COLLECTION,
      rkey,
    });

    const existingValue = existing.value as unknown as PlaylistRecord;
    const filtered = existingValue.tracks.filter(
      (track) => track.uri !== trackUri,
    );

    if (filtered.length === 0) {
      return {
        error: "Cannot remove the last track. Delete the playlist instead.",
      };
    }

    await agent.com.atproto.repo.putRecord({
      repo: did,
      collection: COLLECTION,
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
    return { success: true };
  } catch (error) {
    console.error("Failed to remove track from playlist:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again.",
    };
  }
}

export async function getUserPlaylistsAction() {
  const session = await getSession();
  if (!session) {
    return [];
  }

  const agent = new Agent(session);
  const did = agent.assertDid;

  try {
    const { data } = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: COLLECTION,
      limit: 50,
    });

    return data.records.map((record) => {
      const value = record.value as unknown as PlaylistRecord;
      return {
        rkey: record.uri.split("/")[4]!,
        name: value.name,
      };
    });
  } catch (error) {
    console.error("Failed to fetch user playlists:", error);
    return [];
  }
}
