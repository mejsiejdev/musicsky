"use client";

import Image from "next/image";
import { EllipsisIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "./delete-dialog";

export function Song({
  rkey,
  title,
  coverArt,
  audio,
  genre,
  duration,
  description,
  isOwner,
}: {
  rkey: string;
  title: string;
  coverArt: string | null;
  audio: string;
  genre: string | null;
  duration: number;
  description: string | null;
  isOwner: boolean;
}) {
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <EllipsisIcon className="cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/*
            <DropdownMenuItem>
              <Share2Icon />
              Share
            </DropdownMenuItem>
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
      <audio controls src={audio} />
    </div>
  );
}
