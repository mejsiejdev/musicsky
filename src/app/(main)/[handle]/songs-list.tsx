import { Song } from "@/components/song";
import { type SongProps } from "@/types/song";
import { Agent } from "@atproto/api";
import { IdResolver } from "@atproto/identity";
import type { OAuthSession } from "@atproto/oauth-client-node";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { type TrackRecord } from "@/types/song";
import { getSession } from "@/lib/auth/session";

function getRkey(uri: string) {
  return uri.split("/")[4]!;
}

async function getDid(handle: string) {
  const agent = new Agent("https://public.api.bsky.app");
  try {
    const { data: identity } = await agent.resolveHandle({ handle });
    const did = identity.did;
    return did;
  } catch (error) {
    console.error("Failed to fetch DID for", handle, error);
    return null;
  }
}

async function getPds(did: string) {
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

async function getSongs(
  pds: string,
  did: string,
  handle: string,
  sessionDid: string | null,
) {
  "use cache";
  cacheTag(`songs-${did}`);
  try {
    const agent = new Agent(pds);

    const { data } = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: "app.musicsky.temp.song",
      limit: 50,
    });
    return data.records.map((record) => {
      const value = record.value as unknown as TrackRecord;
      return {
        uri: record.uri,
        cid: record.cid,
        rkey: getRkey(record.uri),
        title: value.title,
        slug: value.slug,
        coverArt: `${pds}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${value.coverArt?.ref?.toString()}`,
        audio: `${pds}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${value.audio.ref.toString()}`,
        genre: value.genre ?? null,
        duration: value.duration,
        description: value.description ?? null,
        author: handle,
        isOwner: sessionDid === record.uri.split("/")[2],
      };
    });
  } catch (error) {
    console.error("Failed to fetch songs for", did, error);
    return [];
  }
}

async function getUserInteractions(session: OAuthSession | null) {
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

export async function SongsList({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profileDid = await getDid(handle);
  if (!profileDid) {
    notFound();
  }
  const pds = await getPds(profileDid);
  if (!pds) {
    notFound();
  }
  const session = await getSession();
  const songs = await getSongs(
    pds,
    profileDid,
    handle,
    session ? session.did : null,
  );
  const { likedUris, repostedUris } = await getUserInteractions(session);

  return songs.map((song) => {
    const songProps: SongProps = {
      ...song,
      likeRkey: likedUris.get(song.uri) ?? null,
      repostRkey: repostedUris.get(song.uri) ?? null,
    };
    return <Song key={song.title} {...songProps} />;
  });
}
