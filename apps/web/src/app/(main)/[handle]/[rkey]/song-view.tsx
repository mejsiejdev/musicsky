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

export async function getUserProfile(
  did: string,
): Promise<{ avatar?: string; displayName?: string }> {
  try {
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${did}`,
    );
    if (!res.ok) return {};
    const data = (await res.json()) as {
      avatar?: string;
      displayName?: string;
    };
    return { avatar: data.avatar, displayName: data.displayName };
  } catch {
    return {};
  }
}

export async function getSong(
  pds: string,
  did: string,
  handle: string,
  rkey: string,
) {
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
  const songAuthorProfile = await getUserProfile(profileDid);
  const [userHandle, userProfile] = session
    ? await Promise.all([
        getHandleFromDid(session.did),
        getUserProfile(session.did),
      ])
    : [undefined, {}];

  return (
    <div className="flex flex-col gap-4">
      <Song
        {...song}
        isOwner={isOwner}
        loggedIn={session !== null}
        likeRkey={likedUris.get(song.uri) ?? null}
        repostRkey={repostedUris.get(song.uri) ?? null}
        userAvatar={userProfile.avatar}
        userHandle={userHandle}
        songAuthorAvatar={songAuthorProfile.avatar}
      />
      <Suspense>
        <CommentSection
          uri={song.uri}
          cid={song.cid}
          songHandle={handle}
          songRkey={rkey}
          songTitle={song.title}
          songCoverArt={song.coverArt}
          songAuthor={song.author}
          songAuthorDisplayName={songAuthorProfile.displayName}
          songAuthorAvatar={songAuthorProfile.avatar}
          songDescription={song.description}
          isLoggedIn={session !== null}
          userDid={session?.did}
          userHandle={userHandle}
          userAvatar={userProfile.avatar}
        />
      </Suspense>
    </div>
  );
}
