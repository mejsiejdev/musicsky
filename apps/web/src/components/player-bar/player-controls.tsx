"use client";

import {
  PlayIcon,
  PauseIcon,
  XIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react";
import { usePlayerStore } from "@/stores/player-store";
import { cn } from "@/lib/utils";

export function PlayerControls() {
  const isPlaying = usePlayerStore((store) => store.isPlaying);
  const hasQueue = usePlayerStore((store) => store.queue.length > 0);
  const isShuffled = usePlayerStore((store) => store.isShuffled);
  const pause = usePlayerStore((store) => store.pause);
  const resume = usePlayerStore((store) => store.resume);
  const stop = usePlayerStore((store) => store.stop);
  const next = usePlayerStore((store) => store.next);
  const previous = usePlayerStore((store) => store.previous);
  const toggleShuffle = usePlayerStore((store) => store.toggleShuffle);

  return (
    <div className="flex items-center gap-4">
      {hasQueue && (
        <>
          <button
            onClick={toggleShuffle}
            aria-label="Toggle shuffle"
            className="cursor-pointer"
          >
            <ShuffleIcon
              size={18}
              className={cn(isShuffled && "text-primary")}
            />
          </button>
          <button
            onClick={previous}
            aria-label="Previous"
            className="cursor-pointer"
          >
            <SkipBackIcon size={18} />
          </button>
        </>
      )}
      <button
        onClick={isPlaying ? pause : resume}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="cursor-pointer"
      >
        {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
      </button>
      {hasQueue && (
        <button onClick={next} aria-label="Next" className="cursor-pointer">
          <SkipForwardIcon size={18} />
        </button>
      )}
      <button
        onClick={stop}
        aria-label="Close player"
        className="cursor-pointer"
      >
        <XIcon size={18} />
      </button>
    </div>
  );
}
