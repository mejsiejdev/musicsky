import { Agent } from "@atproto/api";
import { IdResolver } from "@atproto/identity";

export async function getSongs(handle: string) {
  const agent = new Agent("https://public.api.bsky.app");
  const resolver = new IdResolver();

  try {
    const { data: identity } = await agent.resolveHandle({ handle });
    const did = identity.did;

    const doc = await resolver.did.resolve(did);

    const pdsService = doc?.service?.find(
      (service) => service.id === "#atproto_pds",
    );
    if (!pdsService?.serviceEndpoint) {
      throw new Error("No PDS endpoint found for this user");
    }

    const pdsAgent = new Agent(pdsService.serviceEndpoint as string);

    const { data } = await pdsAgent.com.atproto.repo.listRecords({
      repo: did,
      collection: "app.musicsky.temp.track",
      limit: 50,
    });

    return data.records;
  } catch (error) {
    console.error("Failed to fetch songs for", handle, error);
    return [];
  }
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const songs = await getSongs(handle);

  return (
    <main className="flex flex-col gap-6 w-full max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold">Songs by {handle}</h1>

      {songs.length === 0 ? (
        <p className="text-muted-foreground">No songs found for this user.</p>
      ) : (
        <ul className="space-y-4">
          {songs.map((song) => {
            const record = song.value as unknown as {
              title: string;
              description?: string;
              genre?: string;
              duration: number;
              createdAt: string;
            };
            return (
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
            );
          })}
        </ul>
      )}
    </main>
  );
}
