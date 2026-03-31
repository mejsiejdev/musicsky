import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Song } from "@/components/song";
import { CommentDetailList } from "@/components/comment/comment-detail-list";
import { getSession } from "@/lib/auth/session";
import {
  getDid,
  getHandleFromDid,
  getPds,
  getUserInteractions,
} from "@/lib/songs";
import { getSong, getUserProfile } from "../song-view";
import {
  getComments,
  buildThread,
  findNodeByRkey,
  buildAncestorChain,
} from "@/lib/comments";

export async function CommentDetailView({
  params,
}: {
  params: Promise<{ handle: string; rkey: string; commentRkey: string }>;
}) {
  const { handle, rkey, commentRkey } = await params;

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

  const data = await getComments(song.uri);
  const threadRoots = buildThread(data.comments);
  const focusedNode = findNodeByRkey(threadRoots, commentRkey);

  if (!focusedNode) {
    notFound();
  }

  const ancestors = buildAncestorChain(
    data.comments,
    focusedNode.comment.uri,
    song.uri,
  );

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
        <CommentDetailList
          songHandle={handle}
          songRkey={rkey}
          trackUri={song.uri}
          trackCid={song.cid}
          ancestors={ancestors}
          focused={focusedNode}
          isLoggedIn={session !== null}
          userDid={session?.did}
          userHandle={userHandle}
          userAvatar={userProfile.avatar}
        />
      </Suspense>
    </div>
  );
}
