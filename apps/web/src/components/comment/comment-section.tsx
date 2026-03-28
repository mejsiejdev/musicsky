"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";
import { MessageCircleIcon } from "lucide-react";
import { Comment } from "./comment";
import { CommentInput } from "./comment-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface CommentAuthor {
  did: string;
  handle: string;
  pds: string;
}

interface CommentView {
  uri: string;
  cid: string;
  text: string;
  author: CommentAuthor;
  createdAt: string;
  parent?: { uri: string; cid: string };
  deleted?: boolean;
}

interface CommentsResponse {
  comments: CommentView[];
  cursor?: string;
  totalCount: number;
}

interface CommentNode {
  comment: CommentView;
  children: CommentNode[];
}

const VISIBLE_REPLIES = 3;

function buildThread(comments: CommentView[]): CommentNode[] {
  const nodeMap = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const comment of comments) {
    nodeMap.set(comment.uri, { comment, children: [] });
  }

  for (const comment of comments) {
    const node = nodeMap.get(comment.uri)!;
    if (comment.parent) {
      const parentNode = nodeMap.get(comment.parent.uri);
      if (parentNode) {
        parentNode.children.push(node);
        continue;
      }
    }
    roots.push(node);
  }

  return pruneDeletedLeaves(roots);
}

function pruneDeletedLeaves(nodes: CommentNode[]): CommentNode[] {
  return nodes.filter((node) => {
    node.children = pruneDeletedLeaves(node.children);
    return !node.comment.deleted || node.children.length > 0;
  });
}

async function fetchComments(url: string): Promise<CommentsResponse> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return (await res.json()) as CommentsResponse;
}

export function CommentSection({
  uri,
  cid,
  songTitle,
  isLoggedIn,
  userDid,
  userHandle,
}: {
  uri: string;
  cid: string | undefined;
  songTitle: string;
  isLoggedIn: boolean;
  userDid?: string;
  userHandle?: string;
}) {
  const [replyTarget, setReplyTarget] = useState<{
    uri: string;
    cid: string;
    handle: string;
  } | null>(null);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/comments?uri=${encodeURIComponent(uri)}&limit=${MAX_LIMIT}`,
    fetchComments,
    { refreshInterval: 60_000 },
  );

  const handleCommentPosted = useCallback(
    (text: string) => {
      const parent = replyTarget;
      setReplyTarget(null);

      if (userDid && userHandle) {
        const optimisticComment: CommentView = {
          uri: `at://${userDid}/app.musicsky.temp.comment/${Date.now()}`,
          cid: "optimistic",
          text,
          author: { did: userDid, handle: userHandle, pds: "" },
          createdAt: new Date().toISOString(),
          ...(parent ? { parent: { uri: parent.uri, cid: parent.cid } } : {}),
        };

        void mutate(
          (current) => {
            if (!current) return current;
            return {
              ...current,
              totalCount: current.totalCount + 1,
              comments: [...current.comments, optimisticComment],
            };
          },
          { revalidate: true },
        );
      } else {
        void mutate();
      }
    },
    [mutate, replyTarget, userDid, userHandle],
  );

  const handleReply = useCallback(
    (commentUri: string, commentCid: string, handle: string) => {
      setReplyTarget({ uri: commentUri, cid: commentCid, handle });
    },
    [],
  );

  const handleDeleted = useCallback(() => {
    void mutate();
  }, [mutate]);

  const allComments = data?.comments ?? [];
  const totalCount = data?.totalCount ?? 0;
  const threadRoots = allComments.length > 0 ? buildThread(allComments) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-2">
        <MessageCircleIcon size={18} />
        <h2 className="text-sm font-medium">
          {isLoading
            ? "Comments"
            : `${totalCount} ${totalCount === 1 ? "comment" : "comments"}`}
        </h2>
      </div>

      {isLoggedIn && cid && (
        <CommentInput
          uri={uri}
          cid={cid}
          songTitle={songTitle}
          onClose={() => setReplyTarget(null)}
          onCommentPosted={handleCommentPosted}
          parentUri={replyTarget?.uri}
          parentCid={replyTarget?.cid}
          replyToHandle={replyTarget?.handle}
        />
      )}

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex flex-row gap-3">
              <Skeleton className="size-6 rounded-full shrink-0" />
              <div className="flex flex-col gap-1 w-full">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-muted-foreground">
          Failed to load comments.
        </p>
      )}

      {!isLoading && !error && allComments.length === 0 && (
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
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const MAX_LIMIT = 50;

function CommentThread({
  node,
  trackUri,
  userDid,
  isLoggedIn,
  onReply,
  onDeleted,
}: {
  node: CommentNode;
  trackUri: string;
  userDid?: string;
  isLoggedIn: boolean;
  onReply: (uri: string, cid: string, handle: string) => void;
  onDeleted: () => void;
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
        onDeleted={onDeleted}
      />

      {visibleChildren.map((child) => (
        <CommentThread
          key={child.comment.uri}
          node={child}
          trackUri={trackUri}
          userDid={userDid}
          isLoggedIn={isLoggedIn}
          onReply={onReply}
          onDeleted={onDeleted}
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
