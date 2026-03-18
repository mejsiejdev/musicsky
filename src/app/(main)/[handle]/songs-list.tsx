import { Song } from "@/components/song";
import { type SongProps, type TrackRecord } from "@/types/song";
import { Agent } from "@atproto/api";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getDid,
  getPds,
  getUserInteractions,
  mapRecordToSong,
} from "@/lib/songs";
import { COLLECTIONS, isResourceOwner } from "@/lib/atproto";

async function getSongs(pds: string, did: string, handle: string) {
  "use cache";
  cacheTag(`songs-${did}`);
  try {
    const agent = new Agent(pds);

    const { data } = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: COLLECTIONS.song,
      limit: 50,
    });
    return data.records.map((record) => {
      const value = record.value as unknown as TrackRecord;
      return mapRecordToSong(record.uri, value, pds, did, handle, record.cid);
    });
  } catch (error) {
    console.error("Failed to fetch songs for", did, error);
    return [];
  }
}

export async function SongsList({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const [profileDid, session] = await Promise.all([
    getDid(handle),
    getSession(),
  ]);
  if (!profileDid) {
    notFound();
  }
  const pds = await getPds(profileDid);
  if (!pds) {
    notFound();
  }
  const [songs, { likedUris, repostedUris }] = await Promise.all([
    getSongs(pds, profileDid, handle),
    getUserInteractions(session),
  ]);

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
