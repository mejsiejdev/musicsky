import { Agent } from "@atproto/api";
import { IdResolver } from "@atproto/identity";
import { Record as TrackRecord } from "@/lib/lexicons/types/app/musicsky/temp/track";
import { Song } from "./song";
import { notFound } from "next/navigation";

export async function getDid(handle: string) {
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

export async function getSongs(pds: string, did: string) {
  try {
    const agent = new Agent(pds);

    const { data } = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: "app.musicsky.temp.track",
      limit: 50,
    });

    console.log(data);

    return data.records.map((record) => {
      const value = record.value as TrackRecord;
      return {
        rkey: record.uri.split("/")[4],
        title: value.title,
        coverArt: `${pds}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${value.coverArt?.ref?.toString()}`,
        audio: `${pds}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${value.audio.ref.toString()}`,
        genre: value.genre,
        duration: value.duration,
        description: value.description,
        isOwner: did === record.uri.split("/")[2],
      };
    });
  } catch (error) {
    console.error("Failed to fetch songs for", did, error);
    return [];
  }
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
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
    <main className="flex flex-col gap-6 w-full max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold">Songs by {handle}</h1>

      {songs.length === 0 ? (
        <p className="text-muted-foreground">No songs found for this user.</p>
      ) : (
        <ul className="space-y-4">
          {songs.map((song) => (
            <Song key={song.title} {...song} />
          ))}
          {/*songs.map((song) => (
              <li key={song.uri} className="bg-card p-4 rounded-lg border">
                <h2 className="text-xl font-semibold">{record.title}</h2>
                {record.description && (
                  <p className="text-muted-foreground mt-2">
                    {record.description}
                  </p>
                )}
                <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                  {record.genre && <span>{record.genre}</span>}
                  <span>
                    {Math.floor(record.duration / 60)}:
                    {String(record.duration % 60).padStart(2, "0")}
                  </span>
                </div>
              </li>
            )
          )*/}
        </ul>
      )}
    </main>
  );
}
