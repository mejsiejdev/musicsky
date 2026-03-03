"use client";

import Image from "next/image";
import { TrashIcon } from "lucide-react";
import { deleteSong } from "./actions";

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
  coverArt?: string;
  audio: string;
  genre?: string;
  duration: number;
  description?: string;
  isOwner: boolean;
}) {
  return (
    <div key={title} className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4">
          {coverArt && (
            <Image src={coverArt} alt={title} width={100} height={100} />
          )}
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">{title}</h2>
            {genre && <h3>{genre}</h3>}
            {description && <p>{description}</p>}
          </div>
        </div>
        <div>
          {isOwner && (
            <TrashIcon
              className="text-red-500 cursor-pointer"
              onClick={() => deleteSong(rkey)}
            />
          )}
        </div>
      </div>
      <audio controls src={audio} />
    </div>
  );
}
