import { Song } from "@/components/song";
import type { SongProps } from "@/types/song";
import type { PlayerSong } from "@/stores/player-store";
import { PlaylistQueueProvider } from "@/components/playlist/playlist-queue-context";
import { getSession } from "@/lib/auth/session";
import { APPVIEW_URL } from "@/lib/api";
import { getRkeyFromUri } from "@/lib/atproto";

interface AuthorView {
  did: string;
  handle: string;
  pds: string;
}

interface ViewerState {
  like?: string;
  repost?: string;
}

interface SongView {
  uri: string;
  cid: string;
  author: AuthorView;
  record: unknown;
  likeCount?: number;
  repostCount?: number;
  commentCount?: number;
  viewer?: ViewerState;
  indexedAt: string;
  createdAt?: string;
}

interface FeedOutput {
  cursor?: string;
  songs: SongView[];
}

function getBlobProxyUrl(did: string, ref: unknown): string {
  const blobRef = ref as { ref?: { $link?: string }; cid?: string } | null;
  const cid = blobRef?.ref?.["$link"] ?? blobRef?.cid;
  if (!cid) return "";
  return `${APPVIEW_URL}/blob/${did}/${cid}`;
}

function songViewToProps(
  song: SongView,
  sessionDid: string | undefined,
): SongProps {
  const record = song.record as {
    title: string;
    audio: unknown;
    coverArt: unknown;
    duration: number;
    genre?: string;
    description?: string;
  };

  return {
    uri: song.uri,
    cid: song.cid,
    rkey: getRkeyFromUri(song.uri),
    title: record.title,
    coverArt: getBlobProxyUrl(song.author.did, record.coverArt),
    audio: getBlobProxyUrl(song.author.did, record.audio),
    duration: record.duration,
    genre: record.genre ?? null,
    description: record.description ?? null,
    author: song.author.handle,
    createdAt: song.createdAt ?? song.indexedAt,
    commentCount: song.commentCount,
    isOwner: sessionDid === song.author.did,
    loggedIn: sessionDid !== undefined,
    likeRkey: song.viewer?.like ? getRkeyFromUri(song.viewer.like) : null,
    repostRkey: song.viewer?.repost ? getRkeyFromUri(song.viewer.repost) : null,
  };
}

async function fetchFeed(viewer?: string): Promise<FeedOutput> {
  try {
    const params = new URLSearchParams({ limit: "30" });
    if (viewer) params.set("viewer", viewer);
    const res = await fetch(
      `${APPVIEW_URL}/xrpc/app.musicsky.temp.getFeed?${params.toString()}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return { songs: [] };
    return (await res.json()) as FeedOutput;
  } catch {
    return { songs: [] };
  }
}

export async function Feed() {
  const session = await getSession();
  const feed = await fetchFeed(session?.did);

  if (feed.songs.length === 0) {
    return (
      <p className="text-muted-foreground">
        No songs yet. Be the first to upload one!
      </p>
    );
  }

  const songs = feed.songs.map((song) => songViewToProps(song, session?.did));

  const queueSongs: PlayerSong[] = songs.map((song) => ({
    uri: song.uri,
    cid: song.cid,
    rkey: song.rkey,
    title: song.title,
    coverArt: song.coverArt,
    audio: song.audio,
    duration: song.duration,
    author: song.author,
  }));

  return (
    <PlaylistQueueProvider songs={queueSongs}>
      {songs.map((song) => (
        <Song key={song.uri} {...song} />
      ))}
    </PlaylistQueueProvider>
  );
}
