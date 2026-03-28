import { Suspense } from "react";
import { Song } from "@/components/song";
import { CommentSection } from "@/components/comment/comment-section";
import { type TrackRecord } from "@/types/song";
import { Agent } from "@atproto/api";
import { notFound } from "next/navigation";
import { cacheTag } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  getDid,
  getHandleFromDid,
  getPds,
  getUserInteractions,
  mapRecordToSong,
} from "@/lib/songs";

async function getSong(pds: string, did: string, handle: string, rkey: string) {
  "use cache";
  cacheTag(`song-${did}-${rkey}`);
  const agent = new Agent(pds);
  try {
    const { data } = await agent.com.atproto.repo.getRecord({
      repo: did,
      collection: "app.musicsky.temp.song",
      rkey,
    });
    const value = data.value as unknown as TrackRecord;
    return mapRecordToSong(data.uri, value, pds, did, handle, data.cid);
  } catch (error) {
    console.error("Failed to fetch song", rkey, "for", did, error);
    return null;
  }
}

export async function SongView({
  params,
}: {
  params: Promise<{ handle: string; rkey: string }>;
}) {
  const { handle, rkey } = await params;

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

  const [song, { likedUris, repostedUris }] = await Promise.all([
    getSong(pds, profileDid, handle, rkey),
    getUserInteractions(session),
  ]);

  if (!song) {
    notFound();
  }

  const isOwner = session?.did === song.uri.split("/")[2];
  const userHandle = session
    ? await getHandleFromDid(session.did)
    : undefined;

  return (
    <>
      <Song
        {...song}
        isOwner={isOwner}
        loggedIn={session !== null}
        likeRkey={likedUris.get(song.uri) ?? null}
        repostRkey={repostedUris.get(song.uri) ?? null}
      />
      <Suspense>
        <CommentSection
          uri={song.uri}
          cid={song.cid}
          songTitle={song.title}
          isLoggedIn={session !== null}
          userDid={session?.did}
          userHandle={userHandle}
        />
      </Suspense>
    </>
  );
}
