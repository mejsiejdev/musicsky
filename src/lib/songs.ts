import { Agent } from "@atproto/api";
import { IdResolver } from "@atproto/identity";
import type { OAuthSession } from "@atproto/oauth-client-node";
import type { SongProps, TrackRecord } from "@/types/song";

export function getRkey(uri: string) {
  return uri.split("/")[4]!;
}

export function mapRecordToSong(
  uri: string,
  value: TrackRecord,
  pds: string,
  did: string,
  handle: string,
  cid?: string,
): Omit<SongProps, "isOwner" | "likeRkey" | "repostRkey"> {
  return {
    uri,
    cid: cid,
    rkey: getRkey(uri),
    title: value.title,
    coverArt: `${pds}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${value.coverArt.ref.toString()}`,
    audio: `${pds}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${value.audio.ref.toString()}`,
    genre: value.genre ?? null,
    duration: value.duration,
    description: value.description ?? null,
    author: handle,
  };
}

export async function getDid(handle: string) {
  const agent = new Agent("https://public.api.bsky.app");
  try {
    const { data: identity } = await agent.resolveHandle({ handle });
    return identity.did;
  } catch (error) {
    console.error("Failed to fetch DID for", handle, error);
    return null;
  }
}

export async function getPds(did: string) {
  const resolver = new IdResolver();
  try {
    const doc = await resolver.did.resolve(did);
    const pdsService = doc?.service?.find(
      (service) => service.id === "#atproto_pds",
    );
    if (!pdsService?.serviceEndpoint) {
      throw new Error("No PDS endpoint found for this user");
    }
    return pdsService.serviceEndpoint as string;
  } catch (error) {
    console.error("Failed to fetch PDS URL for", did, error);
    return null;
  }
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
      collection: "app.musicsky.temp.like",
      limit: 100,
    }),
    agent.com.atproto.repo.listRecords({
      repo: session.did,
      collection: "app.musicsky.temp.repost",
      limit: 100,
    }),
  ]);
  for (const record of likesRes.data.records) {
    const subjectUri = (record.value as { subject: { uri: string } }).subject
      .uri;
    likedUris.set(subjectUri, getRkey(record.uri));
  }
  for (const record of repostsRes.data.records) {
    const subjectUri = (record.value as { subject: { uri: string } }).subject
      .uri;
    repostedUris.set(subjectUri, getRkey(record.uri));
  }
  return { likedUris, repostedUris };
}
