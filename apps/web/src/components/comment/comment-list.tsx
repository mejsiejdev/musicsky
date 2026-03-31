"use client";

import Link from "next/link";
import { Comment } from "./comment";
import type { CommentNode } from "@/lib/comment-tree";

function getRkey(uri: string) {
  return uri.split("/")[4]!;
}

const VISIBLE_REPLIES = 3;

export function CommentList({
  uri,
  cid,
  songHandle,
  songRkey,
  isLoggedIn,
  userDid,
  userAvatar,
  userHandle,
  threadRoots,
}: {
  uri: string;
  cid: string | undefined;
  songHandle: string;
  songRkey: string;
  isLoggedIn: boolean;
  userDid?: string;
  userAvatar?: string;
  userHandle?: string;
  threadRoots: CommentNode[];
}) {
  return (
    <>
      {threadRoots.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first to comment!
        </p>
      )}

      {threadRoots.length > 0 && (
        <div className="flex flex-col">
          {threadRoots.map((node) => (
            <CommentThread
              key={node.comment.uri}
              node={node}
              trackUri={uri}
              trackCid={cid}
              songHandle={songHandle}
              songRkey={songRkey}
              userDid={userDid}
              isLoggedIn={isLoggedIn}
              userAvatar={userAvatar}
              userHandle={userHandle}
            />
          ))}
        </div>
      )}
    </>
  );
}

function CommentThread({
  node,
  trackUri,
  trackCid,
  songHandle,
  songRkey,
  userDid,
  isLoggedIn,
  userAvatar,
  userHandle,
}: {
  node: CommentNode;
  trackUri: string;
  trackCid: string | undefined;
  songHandle: string;
  songRkey: string;
  userDid?: string;
  isLoggedIn: boolean;
  userAvatar?: string;
  userHandle?: string;
}) {
  const { comment, children } = node;
  const commentRkey = getRkey(comment.uri);
  const commentHref = `/${songHandle}/${songRkey}/${commentRkey}`;

  const visibleChildren = children.slice(0, VISIBLE_REPLIES);
  const hiddenCount = children.length - VISIBLE_REPLIES;
  const hasVisibleChildren = visibleChildren.length > 0 || hiddenCount > 0;

  return (
    <>
      <Comment
        uri={comment.uri}
        cid={comment.cid}
        text={comment.text}
        author={comment.author}
        createdAt={comment.createdAt}
        deleted={comment.deleted}
        isOwn={userDid === comment.author.did}
        isLoggedIn={isLoggedIn}
        trackUri={trackUri}
        trackCid={trackCid}
        showThreadLine={hasVisibleChildren}
        href={commentHref}
        replyCount={node.children.length}
        likeCount={comment.likeCount}
        likeRkey={comment.viewer?.like ? getRkey(comment.viewer.like) : null}
        userAvatar={userAvatar}
        userHandle={userHandle}
        songHandle={songHandle}
        songRkey={songRkey}
      />

      {visibleChildren.map((child: CommentNode) => (
        <CommentThread
          key={child.comment.uri}
          node={child}
          trackUri={trackUri}
          trackCid={trackCid}
          songHandle={songHandle}
          songRkey={songRkey}
          userDid={userDid}
          isLoggedIn={isLoggedIn}
          userAvatar={userAvatar}
          userHandle={userHandle}
        />
      ))}

      {hiddenCount > 0 && (
        <Link
          href={commentHref}
          className="h-7 text-xs text-muted-foreground hover:underline pl-12"
        >
          Show {hiddenCount} more {hiddenCount === 1 ? "reply" : "replies"}
        </Link>
      )}
    </>
  );
}
