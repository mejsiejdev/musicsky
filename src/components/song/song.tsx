"use client";

import Image from "next/image";
import { RepeatIcon, HeartIcon } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import {
  likeAction,
  unlikeAction,
  repostAction,
  unrepostAction,
} from "./interaction-actions";
import { cn } from "@/lib/utils";
import { PUBLIC_URL } from "@/lib/api";
import { SharePopover } from "./share-popover";
import { SongMenu } from "./song-menu";
import type { SongProps } from "@/types/song";

export function Song({
  uri,
  cid,
  rkey,
  title,
  slug,
  coverArt,
  audio,
  genre,
  duration,
  description,
  author,
  isOwner,
  likeRkey,
  repostRkey,
}: SongProps) {
  const shareUrl = `${PUBLIC_URL}/${author}/${slug}`;
  const [, startTransition] = useTransition();
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(
    likeRkey !== null,
  );
  const [optimisticReposted, setOptimisticReposted] = useOptimistic(
    repostRkey !== null,
  );

  const formattedDuration = `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}`;

  function handleLike() {
    startTransition(async () => {
      if (optimisticLiked) {
        setOptimisticLiked(false);
        if (likeRkey) await unlikeAction(likeRkey, author);
      } else {
        setOptimisticLiked(true);
        await likeAction(uri, cid, author);
      }
    });
  }

  function handleRepost() {
    startTransition(async () => {
      if (optimisticReposted) {
        setOptimisticReposted(false);
        if (repostRkey) await unrepostAction(repostRkey, author);
      } else {
        setOptimisticReposted(true);
        await repostAction(uri, cid, author);
      }
    });
  }

  return (
    <div key={title} className="flex flex-col gap-4">
      <div className="w-full flex flex-row gap-4">
        {coverArt && (
          <Image
            className="rounded-md size-24"
            src={coverArt}
            alt={title}
            width={100}
            height={100}
          />
        )}
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold">{title}</h2>
          {genre && <h3>{genre}</h3>}
          {description && <p>{description}</p>}
          <p>{formattedDuration}</p>
        </div>
      </div>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row gap-12">
          <button
            onClick={handleRepost}
            aria-label="Repost"
            className="flex flex-row items-center gap-2 cursor-pointer"
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
            className="flex flex-row items-center gap-2 cursor-pointer"
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
          <SongMenu isOwner={isOwner} rkey={rkey} />
        </div>
      </div>
      <audio controls src={audio} />
    </div>
  );
}
