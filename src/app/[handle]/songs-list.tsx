import { Song } from "@/components/song";
import { Agent } from "@atproto/api";
import { IdResolver } from "@atproto/identity";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { type Record as TrackRecord } from "@/lib/lexicons/types/app/musicsky/temp/track";

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

async function getSongs(pds: string, did: string) {
  "use cache";
  cacheTag("songs");
  try {
    const agent = new Agent(pds);

    const { data } = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: "app.musicsky.temp.track",
      limit: 50,
    });
    return data.records.map((record) => {
      const value = record.value as TrackRecord;
      return {
        rkey: record.uri.split("/")[4]!,
        title: value.title,
        coverArt: value.coverArt
          ? `${pds}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${value.coverArt?.ref?.toString()}`
          : null,
        audio: `${pds}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${value.audio.ref.toString()}`,
        genre: value.genre ?? null,
        duration: value.duration,
        description: value.description ?? null,
        isOwner: did === record.uri.split("/")[2],
      };
    });
  } catch (error) {
    console.error("Failed to fetch songs for", did, error);
    return [];
  }
}

export async function SongsList({ handle }: { handle: string }) {
  const did = await getDid(handle);
  if (!did) {
    notFound();
  }
  const pds = await getPds(did);
  if (!pds) {
    notFound();
  }
  const songs = await getSongs(pds, did);
  return (
    <div className="flex flex-col gap-4">
      {songs.map((song) => (
        <Song key={song.title} {...song} />
      ))}
    </div>
  );
}
