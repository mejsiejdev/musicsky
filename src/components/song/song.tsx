"use client";

import Image from "next/image";
import { EllipsisIcon, RepeatIcon, HeartIcon, Share2Icon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "./delete-dialog";
import { useOptimistic, useTransition } from "react";
import {
  likeAction,
  unlikeAction,
  repostAction,
  unrepostAction,
} from "./interaction-actions";
import { cn } from "@/lib/utils";
import type { SongProps } from "@/types/song";

const PUBLIC_URL = process.env.PUBLIC_URL ?? "localhost:3000";

export function Song({ song }: { song: SongProps }) {
  const {
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
  } = song;
  const [, startTransition] = useTransition();
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(
    likeRkey !== null,
  );
  const [optimisticReposted, setOptimisticReposted] = useOptimistic(
    repostRkey !== null,
  );

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(`${PUBLIC_URL}/${author}/${slug}`);
      // toast notification would be nice
    } catch (err) {
      console.error("Error copying link:", err);
    }
  }

  function handleLike() {
    startTransition(async () => {
      if (optimisticLiked) {
        setOptimisticLiked(false);
        if (likeRkey) await unlikeAction(likeRkey);
      } else {
        setOptimisticLiked(true);
        await likeAction(uri, cid);
      }
    });
  }

  function handleRepost() {
    startTransition(async () => {
      if (optimisticReposted) {
        setOptimisticReposted(false);
        if (repostRkey) await unrepostAction(repostRkey);
      } else {
        setOptimisticReposted(true);
        await repostAction(uri, cid);
      }
    });
  }

  return (
    <div key={title} className="flex flex-col gap-4">
      <div className="flex flex-row gap-4">
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
            <p>
              {Math.floor(duration / 60)}:
              {String(duration % 60).padStart(2, "0")}
            </p>
          </div>
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
          <Share2Icon
            size={18}
            className="cursor-pointer"
            onClick={handleShare}
            role="button"
            aria-label="Share song"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <EllipsisIcon size={18} className="cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/*
            <DropdownMenuItem>
              <DownloadIcon />
              Download
            </DropdownMenuItem>
            */}
              {isOwner && (
                <>
                  {/*
                <DropdownMenuItem>
                  <PencilIcon />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />*/}
                  <DeleteDialog rkey={rkey} />
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <audio controls src={audio} />
    </div>
  );
}
