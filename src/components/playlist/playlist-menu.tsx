"use client";

import { EllipsisIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditPlaylistDialog } from "./edit-dialog";
import { DeletePlaylistDialog } from "./delete-dialog";

export function PlaylistMenu({
  rkey,
  author,
  name,
  description,
  coverArt,
}: {
  rkey: string;
  author: string;
  name: string;
  description: string | null;
  coverArt: string | null;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-1 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label="Playlist options"
        >
          <EllipsisIcon size={18} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditPlaylistDialog
          rkey={rkey}
          name={name}
          description={description}
          coverArt={coverArt}
        />
        <DeletePlaylistDialog rkey={rkey} author={author} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
