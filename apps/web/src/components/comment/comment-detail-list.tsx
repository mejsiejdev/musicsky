"use client";

import { Comment } from "./comment";
import type { CommentNode, CommentView } from "@/lib/comment-tree";

function getRkey(uri: string) {
  return uri.split("/")[4]!;
}

export function CommentDetailList({
  songHandle,
  songRkey,
  trackUri,
  trackCid,
  ancestors,
  focused,
  isLoggedIn,
  userDid,
  userHandle,
  userAvatar,
}: {
  songHandle: string;
  songRkey: string;
  trackUri: string;
  trackCid: string | undefined;
  ancestors: CommentView[];
  focused: CommentNode;
  isLoggedIn: boolean;
  userDid?: string;
  userHandle?: string;
  userAvatar?: string;
}) {
  return (
    <div className="flex flex-col">
      {ancestors.map((ancestor) => (
        <Comment
          key={ancestor.uri}
          uri={ancestor.uri}
          cid={ancestor.cid}
          text={ancestor.text}
          author={ancestor.author}
          createdAt={ancestor.createdAt}
          deleted={ancestor.deleted}
          isOwn={userDid === ancestor.author.did}
          isLoggedIn={isLoggedIn}
          trackUri={trackUri}
          trackCid={trackCid}
          showThreadLine
          href={`/${songHandle}/${songRkey}/${getRkey(ancestor.uri)}`}
          userAvatar={userAvatar}
          userHandle={userHandle}
          songHandle={songHandle}
          songRkey={songRkey}
        />
      ))}

      <Comment
        uri={focused.comment.uri}
        cid={focused.comment.cid}
        text={focused.comment.text}
        author={focused.comment.author}
        createdAt={focused.comment.createdAt}
        deleted={focused.comment.deleted}
        isOwn={userDid === focused.comment.author.did}
        isLoggedIn={isLoggedIn}
        trackUri={trackUri}
        trackCid={trackCid}
        showThreadLine={focused.children.length > 0}
        userAvatar={userAvatar}
        userHandle={userHandle}
        songHandle={songHandle}
        songRkey={songRkey}
      />

      {focused.children.map((child) => {
        const childRkey = getRkey(child.comment.uri);
        const childHref = `/${songHandle}/${songRkey}/${childRkey}`;
        return (
          <Comment
            key={child.comment.uri}
            uri={child.comment.uri}
            cid={child.comment.cid}
            text={child.comment.text}
            author={child.comment.author}
            createdAt={child.comment.createdAt}
            deleted={child.comment.deleted}
            isOwn={userDid === child.comment.author.did}
            isLoggedIn={isLoggedIn}
            trackUri={trackUri}
            trackCid={trackCid}
            href={childHref}
            replyCount={child.children.length}
            userAvatar={userAvatar}
            userHandle={userHandle}
            songHandle={songHandle}
            songRkey={songRkey}
          />
        );
      })}
    </div>
  );
}
