"use client";

import { createContext, use } from "react";
import type { PlayerSong } from "@/stores/player-store";

const PlaylistQueueContext = createContext<PlayerSong[] | null>(null);

export function PlaylistQueueProvider({
  songs,
  children,
}: {
  songs: PlayerSong[];
  children: React.ReactNode;
}) {
  return <PlaylistQueueContext value={songs}>{children}</PlaylistQueueContext>;
}

export function usePlaylistQueue() {
  return use(PlaylistQueueContext);
}
