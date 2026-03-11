import { create } from "zustand";

export interface PlayerSong {
  uri: string;
  cid?: string;
  rkey: string;
  title: string;
  coverArt: string;
  audio: string;
  duration: number;
  author: string;
  likeRkey: string | null;
  repostRkey: string | null;
}

interface PlayerState {
  currentSong: PlayerSong | null;
  isPlaying: boolean;
  playSong: (song: PlayerSong) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setLikeRkey: (rkey: string | null) => void;
  setRepostRkey: (rkey: string | null) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  isPlaying: false,
  playSong: (song) => set({ currentSong: song, isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () => set({ currentSong: null, isPlaying: false }),
  setLikeRkey: (rkey) =>
    set((state) => ({
      currentSong: state.currentSong
        ? { ...state.currentSong, likeRkey: rkey }
        : null,
    })),
  setRepostRkey: (rkey) =>
    set((state) => ({
      currentSong: state.currentSong
        ? { ...state.currentSong, repostRkey: rkey }
        : null,
    })),
}));
