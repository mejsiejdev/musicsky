"use client";

import { useCallback, useState } from "react";
import { Comment } from "./comment";
import { CommentInput } from "./comment-input";
import { Button } from "@/components/ui/button";
import type { CommentNode } from "./comment-section";

const VISIBLE_REPLIES = 3;

export function CommentList({
  uri,
  cid,
  songTitle,
  isLoggedIn,
  userDid,
  threadRoots,
}: {
  uri: string;
  cid: string | undefined;
  songTitle: string;
  isLoggedIn: boolean;
  userDid?: string;
  userHandle?: string;
  threadRoots: CommentNode[];
}) {
  const [replyTarget, setReplyTarget] = useState<{
    uri: string;
    cid: string;
    handle: string;
  } | null>(null);

  const handleReply = useCallback(
    (commentUri: string, commentCid: string, handle: string) => {
      setReplyTarget({ uri: commentUri, cid: commentCid, handle });
    },
    [],
  );

  return (
    <>
      {isLoggedIn && cid && (
        <CommentInput
          uri={uri}
          cid={cid}
          songTitle={songTitle}
          onClose={() => setReplyTarget(null)}
          parentUri={replyTarget?.uri}
          parentCid={replyTarget?.cid}
          replyToHandle={replyTarget?.handle}
        />
      )}

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
              userDid={userDid}
              isLoggedIn={isLoggedIn}
              onReply={handleReply}
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
  userDid,
  isLoggedIn,
  onReply,
}: {
  node: CommentNode;
  trackUri: string;
  userDid?: string;
  isLoggedIn: boolean;
  onReply: (uri: string, cid: string, handle: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { comment, children } = node;

  const visibleChildren = expanded
    ? children
    : children.slice(0, VISIBLE_REPLIES);
  const hiddenCount = expanded ? 0 : children.length - VISIBLE_REPLIES;
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
        showThreadLine={hasVisibleChildren}
        onReply={onReply}
      />

      {visibleChildren.map((child) => (
        <CommentThread
          key={child.comment.uri}
          node={child}
          trackUri={trackUri}
          userDid={userDid}
          isLoggedIn={isLoggedIn}
          onReply={onReply}
        />
      ))}

      {hiddenCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => setExpanded(true)}
        >
          Show {hiddenCount} more {hiddenCount === 1 ? "reply" : "replies"}
        </Button>
      )}
    </>
  );
}
