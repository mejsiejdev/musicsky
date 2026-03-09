"use client";

import {
  useEffect,
  useRef,
  useOptimistic,
  useTransition,
  useState,
} from "react";
import { usePlayerStore } from "@/stores/player-store";
import {
  likeAction,
  unlikeAction,
  repostAction,
  unrepostAction,
} from "@/components/song/interaction-actions";
import { SongInfo } from "./song-info";
import { PlayerControls } from "./player-controls";
import { ProgressBar } from "./progress-bar";

export function PlayerBar() {
  const currentSong = usePlayerStore((store) => store.currentSong);
  const isPlaying = usePlayerStore((store) => store.isPlaying);
  const pause = usePlayerStore((store) => store.pause);
  const resume = usePlayerStore((store) => store.resume);
  const stop = usePlayerStore((store) => store.stop);
  const setLikeRkey = usePlayerStore((store) => store.setLikeRkey);
  const setRepostRkey = usePlayerStore((store) => store.setRepostRkey);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [, startTransition] = useTransition();
  const [currentTime, setCurrentTime] = useState(0);

  const [optimisticLiked, setOptimisticLiked] = useOptimistic(
    !!currentSong?.likeRkey,
  );
  const [optimisticReposted, setOptimisticReposted] = useOptimistic(
    !!currentSong?.repostRkey,
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play();
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

  function handleLike() {
    if (!currentSong) return;
    startTransition(async () => {
      if (optimisticLiked) {
        setOptimisticLiked(false);
        if (currentSong.likeRkey) {
          await unlikeAction(currentSong.likeRkey, currentSong.author);
          setLikeRkey(null);
        }
      } else {
        setOptimisticLiked(true);
        const newRkey = await likeAction(
          currentSong.uri,
          currentSong.cid,
          currentSong.author,
        );
        setLikeRkey(newRkey ?? null);
      }
    });
  }

  function handleRepost() {
    if (!currentSong) return;
    startTransition(async () => {
      if (optimisticReposted) {
        setOptimisticReposted(false);
        if (currentSong.repostRkey) {
          await unrepostAction(currentSong.repostRkey, currentSong.author);
          setRepostRkey(null);
        }
      } else {
        setOptimisticReposted(true);
        const newRkey = await repostAction(
          currentSong.uri,
          currentSong.cid,
          currentSong.author,
        );
        setRepostRkey(newRkey ?? null);
      }
    });
  }

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
