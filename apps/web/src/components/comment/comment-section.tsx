import { cacheLife, cacheTag } from "next/cache";
import { MessageCircleIcon } from "lucide-react";
import { APPVIEW_URL } from "@/lib/api";
import { CommentList } from "./comment-list";

interface CommentAuthor {
  did: string;
  handle: string;
  pds: string;
}

export interface CommentView {
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

export interface CommentNode {
  comment: CommentView;
  children: CommentNode[];
}

const MAX_LIMIT = 50;

async function getComments(uri: string): Promise<CommentsResponse> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`comments-${uri}`);

  const params = new URLSearchParams({ uri, limit: String(MAX_LIMIT) });
  const res = await fetch(
    `${APPVIEW_URL}/xrpc/app.musicsky.temp.getComments?${params.toString()}`,
  );

  if (!res.ok) {
    return { comments: [], totalCount: 0 };
  }

  return (await res.json()) as CommentsResponse;
}

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

export async function CommentSection({
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
  const data = await getComments(uri);
  const threadRoots = buildThread(data.comments);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-2">
        <MessageCircleIcon size={18} />
        <h2 className="text-sm font-medium">
          {data.totalCount}{" "}
          {data.totalCount === 1 ? "comment" : "comments"}
        </h2>
      </div>

      <CommentList
        uri={uri}
        cid={cid}
        songTitle={songTitle}
        isLoggedIn={isLoggedIn}
        userDid={userDid}
        userHandle={userHandle}
        threadRoots={threadRoots}
      />
    </div>
  );
}
