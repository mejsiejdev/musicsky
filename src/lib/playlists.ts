import { TID } from "@atproto/common-web";
import type { OAuthSession } from "@atproto/oauth-client-node";
import type { PlaylistProps, PlaylistRecord } from "@/types/playlist";
import type { SongProps } from "@/types/song";
import { getUserInteractions } from "@/lib/songs";
import { getRkeyFromUri, buildBlobUrl } from "@/lib/atproto";

export function mapRecordToPlaylist(
  uri: string,
  value: PlaylistRecord,
  pds: string,
  did: string,
  handle: string,
): Omit<PlaylistProps, "isOwner"> {
  const rkey = getRkeyFromUri(uri);
  return {
    uri,
    rkey,
    name: value.name,
    description: value.description ?? null,
    coverArt: value.coverArt
      ? buildBlobUrl(pds, did, value.coverArt.ref)
      : null,
    trackCount: value.tracks.length,
    author: handle,
    createdAt: new Date(TID.fromStr(rkey).timestamp() / 1000).toISOString(),
  };
}

export async function resolvePlaylistTracks(
  tracks: { uri: string; cid: string }[],
  session: OAuthSession | null,
): Promise<(SongProps | null)[]> {
  const uris = tracks.map((track) => track.uri);
  const { resolveRecordsByAuthor } = await import("@/lib/repo");

  const [resolved, { likedUris, repostedUris }] = await Promise.all([
    resolveRecordsByAuthor(uris, session),
    getUserInteractions(session),
  ]);

  return resolved.map((song) => {
    if (!song) return null;
    return {
      ...song,
      likeRkey: likedUris.get(song.uri) ?? null,
      repostRkey: repostedUris.get(song.uri) ?? null,
    };
  });
}
