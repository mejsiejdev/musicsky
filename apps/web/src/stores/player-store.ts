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
}

interface PlayerState {
  currentSong: PlayerSong | null;
  isPlaying: boolean;
  queue: PlayerSong[];
  currentIndex: number;
  history: number[];
  isShuffled: boolean;
  playSong: (song: PlayerSong) => void;
  playFromQueue: (songs: PlayerSong[], startIndex: number) => void;
  next: () => void;
  previous: () => void;
  toggleShuffle: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],
  currentIndex: -1,
  history: [],
  isShuffled: false,

  playSong: (song) =>
    set({
      currentSong: song,
      isPlaying: true,
      queue: [],
      currentIndex: -1,
      history: [],
    }),

  playFromQueue: (songs, startIndex) =>
    set({
      queue: songs,
      currentIndex: startIndex,
      currentSong: songs[startIndex],
      isPlaying: true,
      history: [startIndex],
    }),

  next: () => {
    const { queue, currentIndex, isShuffled, history } = get();
    if (queue.length === 0) {
      get().stop();
      return;
    }

    let nextIndex: number;
    if (isShuffled) {
      if (queue.length === 1) {
        nextIndex = 0;
      } else {
        do {
          nextIndex = Math.floor(Math.random() * queue.length);
        } while (nextIndex === currentIndex);
      }
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }

    set({
      currentIndex: nextIndex,
      currentSong: queue[nextIndex],
      isPlaying: true,
      history: [...history, nextIndex],
    });
  },

  previous: () => {
    const { queue, history } = get();
    if (queue.length === 0) return;

    const newHistory = [...history];
    newHistory.pop(); // remove current

    let prevIndex: number;
    if (newHistory.length > 0) {
      prevIndex = newHistory[newHistory.length - 1]!;
    } else {
      prevIndex = queue.length - 1;
      newHistory.push(prevIndex);
    }

    set({
      currentIndex: prevIndex,
      currentSong: queue[prevIndex],
      isPlaying: true,
      history: newHistory,
    });
  },

  toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () =>
    set({
      currentSong: null,
      isPlaying: false,
      queue: [],
      currentIndex: -1,
      history: [],
    }),
}));
