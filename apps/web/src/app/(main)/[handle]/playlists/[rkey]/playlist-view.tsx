import Image from "next/image";
import { Song } from "@/components/song";
import { type PlaylistProps, type PlaylistRecord } from "@/types/playlist";
import type { PlayerSong } from "@/stores/player-store";
import { Agent } from "@atproto/api";
import { notFound } from "next/navigation";
import { cacheTag } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { getDid, getPds } from "@/lib/songs";
import { mapRecordToPlaylist, resolvePlaylistTracks } from "@/lib/playlists";
import { PlaylistMenu } from "@/components/playlist/playlist-menu";
import { PlaylistQueueProvider } from "@/components/playlist/playlist-queue-context";
import { ListMusicIcon } from "lucide-react";
import { getCommentCounts } from "@/lib/comments";

async function getPlaylist(
  pds: string,
  did: string,
  handle: string,
  rkey: string,
): Promise<
  | (Omit<PlaylistProps, "isOwner"> & {
      tracks: { uri: string; cid: string }[];
    })
  | null
> {
  "use cache";
  cacheTag(`playlist-${did}-${rkey}`);
  const agent = new Agent(pds);
  try {
    const { data } = await agent.com.atproto.repo.getRecord({
      repo: did,
      collection: "app.musicsky.temp.playlist",
      rkey,
    });
    const value = data.value as unknown as PlaylistRecord;
    return {
      ...mapRecordToPlaylist(data.uri, value, pds, did, handle),
      tracks: value.tracks,
    };
  } catch (error) {
    console.error("Failed to fetch playlist", rkey, "for", did, error);
    return null;
  }
}

export async function PlaylistView({
  params,
}: {
  params: Promise<{ handle: string; rkey: string }>;
}) {
  const { handle, rkey } = await params;

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

  const playlist = await getPlaylist(pds, profileDid, handle, rkey);

  if (!playlist) {
    notFound();
  }

  const isOwner = session?.did === playlist.uri.split("/")[2];
  const resolvedTracks = await resolvePlaylistTracks(playlist.tracks, session);

  const trackUris = resolvedTracks
    .filter((track): track is NonNullable<typeof track> => track !== null)
    .map((track) => track.uri);
  const commentCounts = await getCommentCounts(trackUris);

  const queueSongs: PlayerSong[] = resolvedTracks
    .filter((track): track is NonNullable<typeof track> => track !== null)
    .map((track) => ({
      uri: track.uri,
      cid: track.cid,
      rkey: track.rkey,
      title: track.title,
      coverArt: track.coverArt,
      audio: track.audio,
      duration: track.duration,
      author: track.author,
    }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-row items-center gap-4">
          {playlist.coverArt ? (
            <Image
              className="rounded-md size-24 object-cover"
              src={playlist.coverArt}
              alt={playlist.name}
              width={96}
              height={96}
            />
          ) : (
            <div className="rounded-md size-24 bg-muted flex items-center justify-center">
              <ListMusicIcon className="size-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-sm text-muted-foreground">
                {playlist.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {playlist.trackCount}{" "}
              {playlist.trackCount === 1 ? "track" : "tracks"}
            </p>
          </div>
        </div>
        {isOwner && (
          <PlaylistMenu
            rkey={rkey}
            author={handle}
            name={playlist.name}
            description={playlist.description}
            coverArt={playlist.coverArt}
          />
        )}
      </div>

      <PlaylistQueueProvider songs={queueSongs}>
        <div className="flex flex-col gap-4">
          {resolvedTracks.map((track, index) => {
            if (!track) {
              return (
                <div
                  key={index}
                  className="flex flex-row items-center gap-4 opacity-50"
                >
                  <div className="rounded-md size-24 bg-muted flex items-center justify-center">
                    <ListMusicIcon className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track unavailable
                  </p>
                </div>
              );
            }
            return (
              <Song
                key={track.uri}
                {...track}
                commentCount={commentCounts.get(track.uri) ?? 0}
                playlistRkey={isOwner ? rkey : undefined}
                isLastTrack={playlist.trackCount <= 1}
              />
            );
          })}
        </div>
      </PlaylistQueueProvider>
    </div>
  );
}
