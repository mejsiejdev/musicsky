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
  likeCount?: number;
  viewer?: { like?: string };
}

export interface CommentNode {
  comment: CommentView;
  children: CommentNode[];
}

export function buildThread(comments: CommentView[]): CommentNode[] {
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

export function findNodeByRkey(
  nodes: CommentNode[],
  rkey: string,
): CommentNode | null {
  for (const node of nodes) {
    if (node.comment.uri.endsWith(`/${rkey}`)) {
      return node;
    }
    const found = findNodeByRkey(node.children, rkey);
    if (found) return found;
  }
  return null;
}

export function buildAncestorChain(
  comments: CommentView[],
  targetUri: string,
  rootUri: string,
): CommentView[] {
  const commentMap = new Map<string, CommentView>();
  for (const comment of comments) {
    commentMap.set(comment.uri, comment);
  }

  const ancestors: CommentView[] = [];
  let current = commentMap.get(targetUri);

  while (current?.parent && current.parent.uri !== rootUri) {
    const parent = commentMap.get(current.parent.uri);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }

  return ancestors;
}
