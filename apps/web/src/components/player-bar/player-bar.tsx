"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { SongInfo } from "./song-info";
import { PlayerControls } from "./player-controls";
import { ProgressBar } from "./progress-bar";

export function PlayerBar() {
  const currentSong = usePlayerStore((store) => store.currentSong);
  const isPlaying = usePlayerStore((store) => store.isPlaying);
  const stop = usePlayerStore((store) => store.stop);
  const next = usePlayerStore((store) => store.next);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      void audio.play();
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong?.audio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [currentSong?.audio]);

  if (!currentSong) return null;

  function handleSeek(time: number) {
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  }

  function handleEnded() {
    if (usePlayerStore.getState().queue.length > 0) {
      next();
    } else {
      stop();
    }
  }

  return (
    <>
      <audio ref={audioRef} src={currentSong.audio} onEnded={handleEnded} />
      <div className="bg-background flex flex-col gap-4 p-4 w-full border-r border-t border-border">
        <div className="flex items-center justify-between gap-4">
          <SongInfo
            coverArt={currentSong.coverArt}
            title={currentSong.title}
            author={currentSong.author}
          />
          <PlayerControls />
        </div>
        <ProgressBar
          currentTime={currentTime}
          duration={currentSong.duration}
          onSeek={handleSeek}
        />
      </div>
    </>
  );
}
