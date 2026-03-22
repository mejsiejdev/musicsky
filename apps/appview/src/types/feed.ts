export interface AuthorView {
  did: string;
  handle: string;
  pds: string;
}

export interface ViewerState {
  like?: string;
  repost?: string;
}

export interface SongView {
  uri: string;
  cid: string;
  author: AuthorView;
  record: unknown;
  likeCount?: number;
  repostCount?: number;
  viewer?: ViewerState;
  indexedAt: string;
  createdAt: string;
}

export interface FeedOutput {
  cursor?: string;
  songs: SongView[];
}
