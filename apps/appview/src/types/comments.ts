import type { AuthorView } from "./feed.js";

export interface CommentView {
  uri: string;
  cid: string;
  text: string;
  author: AuthorView;
  createdAt: string;
}

export interface CommentsOutput {
  cursor?: string;
  totalCount: number;
  comments: CommentView[];
}
