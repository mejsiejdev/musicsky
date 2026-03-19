import Image from "next/image";
import Link from "next/link";
import { ListMusicIcon } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { PlaylistMenu } from "./playlist-menu";
import type { PlaylistProps } from "@/types/playlist";

export function PlaylistCard({
  rkey,
  name,
  description,
  coverArt,
  trackCount,
  author,
  isOwner,
  createdAt,
}: PlaylistProps) {
  const createdAtDate = new Date(createdAt);

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <Link
        href={`/${author}/playlists/${rkey}`}
        className="flex flex-row items-center gap-4 min-w-0 hover:opacity-80 transition-opacity"
      >
        {coverArt ? (
          <Image
            className="rounded-md size-16 object-cover"
            src={coverArt}
            alt={name}
            width={64}
            height={64}
          />
        ) : (
          <div className="rounded-md size-16 bg-muted flex items-center justify-center">
            <ListMusicIcon className="size-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-semibold truncate">{name}</span>
          <div className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
            <span>
              {trackCount} {trackCount === 1 ? "track" : "tracks"}
            </span>
            <span>&middot;</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <time dateTime={createdAt}>
                  {formatDistanceToNow(createdAtDate, { addSuffix: true })}
                </time>
              </TooltipTrigger>
              <TooltipContent>{format(createdAtDate, "PPP p")}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Link>
      {isOwner && (
        <PlaylistMenu
          rkey={rkey}
          author={author}
          name={name}
          description={description}
          coverArt={coverArt}
        />
      )}
    </div>
  );
}
