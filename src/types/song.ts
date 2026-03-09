import { type BlobRef } from "@atproto/lexicon";

export interface TrackRecord {
  title: string;
  slug: string;
  coverArt: BlobRef;
  audio: BlobRef;
  genre?: string;
  duration: number;
  description?: string;
}

export interface SongProps {
  uri: string;
  cid: string;
  rkey: string;
  title: string;
  slug: string;
  coverArt: string;
  audio: string;
  genre: string | null;
  duration: number;
  description: string | null;
  author: string;
  isOwner: boolean;
  likeRkey: string | null;
  repostRkey: string | null;
}
