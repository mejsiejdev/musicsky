import { Agent } from "@atproto/api";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { COLLECTIONS, getDidFromUri, getRkeyFromUri } from "@/lib/atproto";
import { getHandleFromDid, getPds, mapRecordToSong } from "@/lib/songs";
import type { SongProps, TrackRecord } from "@/types/song";

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return session;
}

interface ResolveByAuthorItem {
  uri: string;
  index: number;
}

export async function resolveRecordsByAuthor(
  uris: string[],
  session: { did: string } | null,
): Promise<(SongProps | null)[]> {
  const tracksByAuthor = new Map<string, ResolveByAuthorItem[]>();
  for (let i = 0; i < uris.length; i++) {
    const uri = uris[i]!;
    const authorDid = getDidFromUri(uri);
    const existing = tracksByAuthor.get(authorDid) ?? [];
    existing.push({ uri, index: i });
    tracksByAuthor.set(authorDid, existing);
  }

  const results: (SongProps | null)[] = new Array(uris.length).fill(null);

  await Promise.all(
    [...tracksByAuthor.entries()].map(async ([authorDid, authorTracks]) => {
      try {
        const authorPds = await getPds(authorDid);
        if (!authorPds) return;

        const songAgent = new Agent(authorPds);
        const [authorHandle, ...songResponses] = await Promise.all([
          getHandleFromDid(authorDid, authorPds),
          ...authorTracks.map(({ uri }) => {
            const rkey = getRkeyFromUri(uri);
            return songAgent.com.atproto.repo
              .getRecord({
                repo: authorDid,
                collection: COLLECTIONS.song,
                rkey,
              })
              .then(({ data }) => ({ data, success: true as const }))
              .catch((error) => {
                console.error("Failed to fetch track", uri, error);
                return { data: null, success: false as const };
              });
          }),
        ]);

        for (let i = 0; i < authorTracks.length; i++) {
          const result = songResponses[i]!;
          if (!result.success) continue;
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
            likeRkey: null,
            repostRkey: null,
          };
        }
      } catch (error) {
        console.error("Failed to resolve tracks for author", authorDid, error);
      }
    }),
  );

  return results;
}
