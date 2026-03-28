export interface SongTable {
  uri: string;
  cid: string;
  did: string;
  rkey: string;
  record: string; // JSON-serialized full record
  indexed_at: string;
  created_at: string; // TID-derived timestamp
}

export interface IdentityTable {
  did: string;
  handle: string;
  pds: string;
  status: string;
  updated_at: string;
}

export interface LikeTable {
  uri: string;
  did: string;
  rkey: string;
  subject_uri: string;
  created_at: string;
}

export interface RepostTable {
  uri: string;
  did: string;
  rkey: string;
  subject_uri: string;
  created_at: string;
}

export interface CommentTable {
  uri: string;
  cid: string;
  did: string;
  rkey: string;
  subject_uri: string;
  parent_uri: string;
  parent_cid: string;
  text: string;
  created_at: string;
  deleted: number;
}

export interface DatabaseSchema {
  song: SongTable;
  identity: IdentityTable;
  like: LikeTable;
  repost: RepostTable;
  comment: CommentTable;
}
