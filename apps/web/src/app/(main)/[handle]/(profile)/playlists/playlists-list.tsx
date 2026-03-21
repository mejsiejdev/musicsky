import { PlaylistCard } from "@/components/playlist";
import { type PlaylistProps, type PlaylistRecord } from "@/types/playlist";
import { Agent } from "@atproto/api";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDid, getPds } from "@/lib/songs";
import { mapRecordToPlaylist } from "@/lib/playlists";
import { ListMusicIcon } from "lucide-react";

async function getPlaylists(
  pds: string,
  did: string,
  handle: string,
): Promise<Omit<PlaylistProps, "isOwner">[]> {
  "use cache";
  cacheTag(`playlists-${did}`);
  try {
    const agent = new Agent(pds);

    const { data } = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: "app.musicsky.temp.playlist",
      limit: 50,
    });
    return data.records.map((record) => {
      const value = record.value as unknown as PlaylistRecord;
      return mapRecordToPlaylist(record.uri, value, pds, did, handle);
    });
  } catch (error) {
    console.error("Failed to fetch playlists for", did, error);
    return [];
  }
}

export async function PlaylistsList({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const [profileDid, session] = await Promise.all([
    getDid(handle),
    getSession(),
  ]);
  if (!profileDid) {
    notFound();
  }
  const pds = await getPds(profileDid);
  if (!pds) {
    notFound();
  }
  const playlists = await getPlaylists(pds, profileDid, handle);

  if (playlists.length === 0) {
    return (
      <div className="flex flex-row text-muted-foreground items-center gap-4">
        <ListMusicIcon />
        <p className="font-semibold">No playlists yet.</p>
      </div>
    );
  }

  return playlists.map((playlist) => (
    <PlaylistCard
      key={playlist.uri}
      {...playlist}
      isOwner={session?.did === playlist.uri.split("/")[2]}
    />
  ));
}
