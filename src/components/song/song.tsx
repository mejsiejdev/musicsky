"use client";

import Image from "next/image";
import { RepeatIcon, HeartIcon, PlayIcon, PauseIcon } from "lucide-react";
import { usePlayerStore } from "@/stores/player-store";
import { useInteraction } from "@/hooks/use-interaction";
import { cn } from "@/lib/utils";
import { PUBLIC_URL } from "@/lib/api";
import { SharePopover } from "./share-popover";
import { SongMenu } from "./song-menu";
import type { SongProps } from "@/types/song";
import { Button } from "../ui/button";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { formatDistanceToNow, format } from "date-fns";

export function Song({
  uri,
  cid,
  rkey,
  title,
  coverArt,
  audio,
  genre,
  description,
  duration,
  author,
  isOwner,
  loggedIn,
  likeRkey,
  repostRkey,
  createdAt,
  playlistRkey,
  isLastTrack,
}: SongProps) {
  const shareUrl = `${PUBLIC_URL}/${author}/${rkey}`;
  const currentSong = usePlayerStore((song) => song.currentSong);
  const isPlaying = usePlayerStore((song) => song.isPlaying);
  const isCurrentSong = currentSong?.rkey === rkey;

  const { optimisticLiked, optimisticReposted, handleLike, handleRepost } =
    useInteraction({ uri, cid, author, likeRkey, repostRkey });

  const createdAtDate = new Date(createdAt);

  function handlePlay() {
    if (isCurrentSong && isPlaying) {
      usePlayerStore.getState().pause();
    } else if (isCurrentSong) {
      usePlayerStore.getState().resume();
    } else {
      usePlayerStore.getState().playSong({
        uri,
        cid,
        rkey,
        title,
        coverArt,
        audio,
        duration,
        author,
        likeRkey,
        repostRkey,
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex flex-row justify-between gap-4">
        <div className="flex flex-row gap-4">
          <Image
            className="rounded-md size-24"
            src={coverArt}
            alt={title}
            width={100}
            height={100}
          />
          <div className="flex flex-col gap-1 h-full justify-between">
            <div className="flex flex-col gap-1">
              <Link
                href={`/${author}/${rkey}`}
                className="text-xl px-0 font-semibold hover:underline"
              >
                {title}
              </Link>
              <Link
                href={`/${author}`}
                className="text-sm text-muted-foreground hover:underline"
              >
                @{author}
              </Link>
            </div>
            <div className="flex flex-row items-center gap-2">
              {genre && <Badge variant={"outline"}>{genre}</Badge>}
              <Tooltip>
                <TooltipTrigger asChild>
                  <time
                    dateTime={createdAt}
                    className="text-xs text-muted-foreground"
                  >
                    {formatDistanceToNow(createdAtDate, {
                      addSuffix: true,
                    })}
                  </time>
                </TooltipTrigger>
                <TooltipContent>
                  {format(createdAtDate, "PPP p")}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
        <Button
          onClick={handlePlay}
          variant={"outline"}
          size="icon"
          className="rounded-full"
          aria-label={isCurrentSong && isPlaying ? "Pause" : "Play"}
        >
          {isCurrentSong && isPlaying ? (
            <PauseIcon className="h-[1.2rem] w-[1.2rem] scale-100" />
          ) : (
            <PlayIcon className="h-[1.2rem] w-[1.2rem] scale-100" />
          )}
        </Button>
      </div>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row gap-12">
          <button
            onClick={handleRepost}
            aria-label="Repost"
            disabled={!cid}
            className="flex flex-row items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RepeatIcon
              size={18}
              className={cn(optimisticReposted && "text-green-500")}
              fill={optimisticReposted ? "currentColor" : "none"}
            />
          </button>
          <button
            onClick={handleLike}
            aria-label="Like"
            disabled={!cid}
            className="flex flex-row items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HeartIcon
              size={18}
              className={cn(optimisticLiked && "text-red-500")}
              fill={optimisticLiked ? "currentColor" : "none"}
            />
          </button>
        </div>
        <div className="flex flex-row items-center gap-4">
          <SharePopover shareUrl={shareUrl} />
          <SongMenu
            isOwner={isOwner}
            loggedIn={loggedIn}
            rkey={rkey}
            uri={uri}
            cid={cid}
            title={title}
            description={description}
            genre={genre}
            coverArt={coverArt}
            playlistRkey={playlistRkey}
            isLastTrack={isLastTrack}
          />
        </div>
      </div>
    </div>
  );
}
