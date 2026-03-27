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
  text: string;
  author: CommentAuthor;
  createdAt: string;
}

interface CommentsResponse {
  comments: CommentView[];
  cursor?: string;
  totalCount: number;
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
}: {
  uri: string;
  cid: string | undefined;
  songTitle: string;
  isLoggedIn: boolean;
}) {
  const [extraComments, setExtraComments] = useState<CommentView[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/comments?uri=${encodeURIComponent(uri)}&limit=20`,
    fetchComments,
  );

  const handleCommentPosted = useCallback(() => {
    setExtraComments([]);
    setCursor(undefined);
    void mutate();
  }, [mutate]);

  const initialCursor = data?.cursor;
  const activeCursor = cursor ?? initialCursor;

  async function handleLoadMore() {
    if (!activeCursor) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        uri,
        limit: "20",
        cursor: activeCursor,
      });
      const res = await fetchComments(
        `/api/comments?${params.toString()}`,
      );
      setExtraComments((prev) => [...prev, ...res.comments]);
      setCursor(res.cursor);
    } finally {
      setLoadingMore(false);
    }
  }

  const allComments = [...(data?.comments ?? []), ...extraComments];
  const totalCount = data?.totalCount ?? 0;
  const hasMore = Boolean(activeCursor) && allComments.length < totalCount;

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
          onClose={() => {}}
          onCommentPosted={handleCommentPosted}
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

      {allComments.length > 0 && (
        <div className="flex flex-col gap-4">
          {allComments.map((comment) => (
            <Comment
              key={comment.uri}
              text={comment.text}
              author={comment.author}
              createdAt={comment.createdAt}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleLoadMore()}
          disabled={loadingMore}
        >
          {loadingMore ? "Loading..." : "Load more comments"}
        </Button>
      )}
    </div>
  );
}
