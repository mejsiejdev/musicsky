import { TID } from "@atproto/common-web";
import { Agent } from "@atproto/api";
import type { OAuthSession } from "@atproto/oauth-client-node";
import type { PlaylistProps, PlaylistRecord } from "@/types/playlist";
import type { SongProps, TrackRecord } from "@/types/song";
import {
  getHandleFromDid,
  getPds,
  getRkey,
  getUserInteractions,
  mapRecordToSong,
} from "@/lib/songs";

export function mapRecordToPlaylist(
  uri: string,
  value: PlaylistRecord,
  pds: string,
  did: string,
  handle: string,
): Omit<PlaylistProps, "isOwner"> {
  return {
    uri,
    rkey: getRkey(uri),
    name: value.name,
    description: value.description ?? null,
    coverArt: value.coverArt
      ? `${pds}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${value.coverArt.ref.toString()}`
      : null,
    trackCount: value.tracks.length,
    author: handle,
    createdAt: new Date(
      TID.fromStr(getRkey(uri)).timestamp() / 1000,
    ).toISOString(),
  };
}

export async function resolvePlaylistTracks(
  tracks: { uri: string; cid: string }[],
  session: OAuthSession | null,
): Promise<(SongProps | null)[]> {
  // Group tracks by author DID
  const tracksByAuthor = new Map<
    string,
    { uri: string; rkey: string; index: number }[]
  >();
  for (let i = 0; i < tracks.length; i++) {
    const parts = tracks[i]!.uri.split("/");
    const authorDid = parts[2]!;
    const rkey = parts[4]!;
    const existing = tracksByAuthor.get(authorDid) ?? [];
    existing.push({ uri: tracks[i]!.uri, rkey, index: i });
    tracksByAuthor.set(authorDid, existing);
  }

  const results: (SongProps | null)[] = new Array(tracks.length).fill(null);

  const [{ likedUris, repostedUris }] = await Promise.all([
    getUserInteractions(session),
    ...[...tracksByAuthor.entries()].map(async ([authorDid, authorTracks]) => {
      try {
        const authorPds = await getPds(authorDid);
        if (!authorPds) return;

        const songAgent = new Agent(authorPds);
        const [authorHandle, ...songResponses] = await Promise.all([
          getHandleFromDid(authorDid, authorPds),
          ...authorTracks.map(({ rkey }) =>
            songAgent.com.atproto.repo
              .getRecord({
                repo: authorDid,
                collection: "app.musicsky.temp.song",
                rkey,
              })
              .then(({ data }) => ({ data, success: true as const }))
              .catch((error) => {
                console.error(
                  "Failed to fetch track",
                  `at://${authorDid}/app.musicsky.temp.song/${rkey}`,
                  error,
                );
                return { data: null, success: false as const };
              }),
          ),
        ]);

        for (let i = 0; i < authorTracks.length; i++) {
          const result = songResponses[i]!;
          if (!result.success || !result.data) continue;
          const value = result.data.value as unknown as TrackRecord;
          const songUri = result.data.uri;
          results[authorTracks[i]!.index] = {
            ...mapRecordToSong(
              songUri,
              value,
              authorPds,
              authorDid,
              authorHandle,
              result.data.cid,
            ),
            isOwner: session?.did === authorDid,
            loggedIn: session !== null,
            likeRkey: likedUris.get(songUri) ?? null,
            repostRkey: repostedUris.get(songUri) ?? null,
          };
        }
      } catch (error) {
        console.error("Failed to resolve tracks for author", authorDid, error);
      }
    }),
  ]);

  return results;
}
