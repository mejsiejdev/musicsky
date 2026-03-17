import { Song } from "@/components/song";
import { type SongProps, type TrackRecord } from "@/types/song";
import { Agent } from "@atproto/api";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getDid,
  getHandleFromDid,
  getPds,
  getUserInteractions,
  mapRecordToSong,
} from "@/lib/songs";
import {
  getDidFromUri,
  getRkeyFromUri,
  isResourceOwner,
  COLLECTIONS,
} from "@/lib/atproto";
import { HeartCrackIcon } from "lucide-react";

interface LikeRecord {
  subject: {
    uri: string;
    cid: string;
  };
  createdAt: string;
}

type LikedSong = Omit<
  SongProps,
  "isOwner" | "loggedIn" | "likeRkey" | "repostRkey"
> & {
  likedAt: string;
};

async function getLikedSongs(
  profileDid: string,
  profilePds: string,
): Promise<LikedSong[]> {
  "use cache";
  cacheTag(`likes-${profileDid}`);
  try {
    const agent = new Agent(profilePds);

    const { data } = await agent.com.atproto.repo.listRecords({
      repo: profileDid,
      collection: COLLECTIONS.like,
      limit: 50,
    });

    const likesByAuthor = new Map<
      string,
      { rkey: string; createdAt: string }[]
    >();
    for (const record of data.records) {
      const like = record.value as unknown as LikeRecord;
      const authorDid = getDidFromUri(like.subject.uri);
      const rkey = getRkeyFromUri(like.subject.uri);
      const existing = likesByAuthor.get(authorDid) ?? [];
      existing.push({ rkey, createdAt: like.createdAt });
      likesByAuthor.set(authorDid, existing);
    }

    const songResults = await Promise.all(
      [...likesByAuthor.entries()].map(async ([authorDid, likes]) => {
        try {
          const authorPds = await getPds(authorDid);
          if (!authorPds) return [];

          const [authorHandle, ...songResponses] = await Promise.all([
            getHandleFromDid(authorDid, authorPds),
            ...likes.map(({ rkey }) => {
              const songAgent = new Agent(authorPds);
              return songAgent.com.atproto.repo
                .getRecord({
                  repo: authorDid,
                  collection: COLLECTIONS.song,
                  rkey,
                })
                .then(({ data: songData }) => ({
                  songData,
                  success: true as const,
                }))
                .catch((error) => {
                  console.error(
                    "Failed to fetch liked song",
                    `at://${authorDid}/${COLLECTIONS.song}/${rkey}`,
                    error,
                  );
                  return { songData: null, success: false as const };
                });
            }),
          ]);

          const songs: LikedSong[] = [];
          for (let i = 0; i < likes.length; i++) {
            const result = songResponses[i]!;
            if (!result.success) continue;
            const { songData } = result;
            const value = songData!.value as unknown as TrackRecord;
            songs.push({
              ...mapRecordToSong(
                songData!.uri,
                value,
                authorPds,
                authorDid,
                authorHandle,
                songData!.cid,
              ),
              likedAt: likes[i]!.createdAt,
            });
          }
          return songs;
        } catch (error) {
          console.error("Failed to fetch songs for author", authorDid, error);
          return [];
        }
      }),
    );

    return songResults
      .flat()
      .sort(
        (songA, songB) =>
          new Date(songB.likedAt).getTime() - new Date(songA.likedAt).getTime(),
      );
  } catch (error) {
    console.error("Failed to fetch likes for", profileDid, error);
    return [];
  }
}

export async function LikesList({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profileDid = await getDid(handle);
  if (!profileDid) {
    notFound();
  }
  const profilePds = await getPds(profileDid);
  if (!profilePds) {
    notFound();
  }
  const session = await getSession();
  const [songs, { likedUris, repostedUris }] = await Promise.all([
    getLikedSongs(profileDid, profilePds),
    getUserInteractions(session),
  ]);

  if (songs.length === 0) {
    return (
      <div className="flex flex-row text-muted-foreground items-center gap-4">
        <HeartCrackIcon />
        <p className="font-semibold">No liked songs yet.</p>
      </div>
    );
  }

  return songs.map((song) => {
    const songProps: SongProps = {
      ...song,
      isOwner: isResourceOwner(session?.did, song.uri),
      loggedIn: session !== null,
      likeRkey: likedUris.get(song.uri) ?? null,
      repostRkey: repostedUris.get(song.uri) ?? null,
    };
    return <Song key={song.uri} {...songProps} />;
  });
}
