import { type BlobRef } from "@atproto/lexicon";

export interface PlaylistRecord {
  name: string;
  description?: string;
  coverArt?: BlobRef;
  tracks: { uri: string; cid: string }[];
  createdAt: string;
  updatedAt?: string;
}

export interface PlaylistProps {
  uri: string;
  rkey: string;
  name: string;
  description: string | null;
  coverArt: string | null;
  trackCount: number;
  author: string;
  isOwner: boolean;
  createdAt: string;
}
