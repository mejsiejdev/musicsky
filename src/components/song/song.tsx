"use client";

import Image from "next/image";
import {
  EllipsisIcon,
  RepeatIcon,
  HeartIcon,
  MessageSquareIcon,
  Share2Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "./delete-dialog";

const PUBLIC_URL = process.env.PUBLIC_URL ?? "localhost:3000";

export function Song({
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
}: {
  rkey: string;
  title: string;
  slug: string;
  coverArt: string | null;
  audio: string;
  genre: string | null;
  duration: number;
  description: string | null;
  author: string;
  isOwner: boolean;
}) {
  async function handleShare() {
    try {
      await navigator.clipboard.writeText(`${PUBLIC_URL}/${author}/${slug}`);
      // toast notification would be nice
    } catch (err) {
      console.error("Error copying link:", err);
    }
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
          <div className="flex flex-row items-center gap-2">
            <MessageSquareIcon size={18} />
            <p className="text-sm">6</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <RepeatIcon size={18} />
            <p className="text-sm">2</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <HeartIcon size={18} />
            <p className="text-sm">12</p>
          </div>
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
