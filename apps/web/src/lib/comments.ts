import { cacheLife, cacheTag } from "next/cache";
import { APPVIEW_URL } from "@/lib/api";
import type { CommentView } from "./comment-tree";

export { buildThread, findNodeByRkey, buildAncestorChain } from "./comment-tree";

interface CommentCountsResponse {
  counts: Record<string, number>;
}

export async function getCommentCounts(
  uris: string[],
): Promise<Map<string, number>> {
  "use cache";
  cacheLife("minutes");

  if (uris.length === 0) return new Map();

  const res = await fetch(
    `${APPVIEW_URL}/xrpc/app.musicsky.temp.getCommentCounts?uris=${uris.join(",")}`,
  );

  if (!res.ok) return new Map();

  const data = (await res.json()) as CommentCountsResponse;
  return new Map(Object.entries(data.counts));
}

interface CommentsResponse {
  comments: CommentView[];
  cursor?: string;
  totalCount: number;
}

const MAX_LIMIT = 50;

export async function getComments(uri: string, viewerDid?: string): Promise<CommentsResponse> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`comments-${uri}`);

  const params = new URLSearchParams({ uri, limit: String(MAX_LIMIT) });
  if (viewerDid) params.set("viewer", viewerDid);
  const res = await fetch(
    `${APPVIEW_URL}/xrpc/app.musicsky.temp.getComments?${params.toString()}`,
  );

  if (!res.ok) {
    return { comments: [], totalCount: 0 };
  }

  return (await res.json()) as CommentsResponse;
}
