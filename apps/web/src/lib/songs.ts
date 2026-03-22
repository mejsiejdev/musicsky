import { Agent } from "@atproto/api";
import type { OAuthSession } from "@atproto/oauth-client-node";
import type { SongProps, TrackRecord } from "@/types/song";
import {
  getRkeyFromUri,
  buildBlobUrl,
  getCreatedAtFromRkey,
  COLLECTIONS,
} from "common";

export { getDid, getPds, getHandleFromDid } from "common";

export function mapRecordToSong(
  uri: string,
  value: TrackRecord,
  pds: string,
  did: string,
  handle: string,
  cid?: string,
): Omit<SongProps, "isOwner" | "loggedIn" | "likeRkey" | "repostRkey"> {
  const rkey = getRkeyFromUri(uri);
  return {
    uri,
    cid: cid,
    rkey,
    title: value.title,
    coverArt: buildBlobUrl(pds, did, value.coverArt.ref),
    audio: buildBlobUrl(pds, did, value.audio.ref),
    genre: value.genre ?? null,
    duration: value.duration,
    description: value.description ?? null,
    author: handle,
    createdAt: getCreatedAtFromRkey(rkey),
  };
}

export async function getUserInteractions(session: OAuthSession | null) {
  const likedUris = new Map<string, string>();
  const repostedUris = new Map<string, string>();
  if (session === null) {
    return { likedUris, repostedUris };
  }
  const agent = new Agent(session);
  const [likesRes, repostsRes] = await Promise.all([
    agent.com.atproto.repo.listRecords({
      repo: session.did,
      collection: COLLECTIONS.like,
      limit: 100,
    }),
    agent.com.atproto.repo.listRecords({
      repo: session.did,
      collection: COLLECTIONS.repost,
      limit: 100,
    }),
  ]);
  for (const record of likesRes.data.records) {
    const subjectUri = (record.value as { subject: { uri: string } }).subject
      .uri;
    likedUris.set(subjectUri, getRkeyFromUri(record.uri));
  }
  for (const record of repostsRes.data.records) {
    const subjectUri = (record.value as { subject: { uri: string } }).subject
      .uri;
    repostedUris.set(subjectUri, getRkeyFromUri(record.uri));
  }
  return { likedUris, repostedUris };
}
