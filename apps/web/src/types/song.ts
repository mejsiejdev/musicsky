import { type BlobRef } from "@atproto/lexicon";

export interface TrackRecord {
  title: string;
  coverArt: BlobRef;
  audio: BlobRef;
  genre?: string;
  duration: number;
  description?: string;
}

export interface SongData {
  uri: string;
  cid?: string;
  rkey: string;
  title: string;
  coverArt: string;
  audio: string;
  genre: string | null;
  duration: number;
  description: string | null;
  author: string;
  createdAt: string;
  commentCount?: number;
}

export interface SongInteraction {
  likeRkey: string | null;
  repostRkey: string | null;
}

export interface SongContext {
  isOwner: boolean;
  loggedIn: boolean;
  userAvatar?: string;
  userHandle?: string;
  songAuthorAvatar?: string;
}

export interface SongPlaylistContext {
  playlistRkey?: string;
  isLastTrack?: boolean;
}

export type SongProps = SongData &
  SongInteraction &
  SongContext &
  SongPlaylistContext;
