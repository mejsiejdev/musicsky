"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { useInteraction } from "@/hooks/use-interaction";
import { SongInfo } from "./song-info";
import { PlayerControls } from "./player-controls";
import { ProgressBar } from "./progress-bar";

export function PlayerBar() {
  const currentSong = usePlayerStore((store) => store.currentSong);
  const isPlaying = usePlayerStore((store) => store.isPlaying);
  const pause = usePlayerStore((store) => store.pause);
  const resume = usePlayerStore((store) => store.resume);
  const stop = usePlayerStore((store) => store.stop);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const { optimisticLiked, optimisticReposted, handleLike, handleRepost } =
    useInteraction({
      uri: currentSong?.uri ?? "",
      cid: currentSong?.cid,
      author: currentSong?.author ?? "",
      likeRkey: currentSong?.likeRkey ?? null,
      repostRkey: currentSong?.repostRkey ?? null,
    });

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

  return (
    <>
      <audio ref={audioRef} src={currentSong.audio} onEnded={stop} />
      <div className="bg-background flex flex-col gap-4 p-4 w-full border-r border-t border-border">
        <div className="flex items-center justify-between gap-4">
          <SongInfo
            coverArt={currentSong.coverArt}
            title={currentSong.title}
            author={currentSong.author}
          />
          <PlayerControls
            isPlaying={isPlaying}
            optimisticLiked={optimisticLiked}
            optimisticReposted={optimisticReposted}
            canInteract={!!currentSong.cid}
            onPlay={resume}
            onPause={pause}
            onStop={stop}
            onLike={handleLike}
            onRepost={handleRepost}
          />
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
