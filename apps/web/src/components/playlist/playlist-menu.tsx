"use client";

import dynamic from "next/dynamic";
import { EllipsisIcon, PencilIcon, TrashIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EditPlaylistDialog = dynamic(
  () =>
    import("./edit-dialog").then((mod) => ({
      default: mod.EditPlaylistDialog,
    })),
  {
    loading: () => (
      <DropdownMenuItem disabled>
        <PencilIcon />
        Edit
      </DropdownMenuItem>
    ),
  },
);

const DeletePlaylistDialog = dynamic(
  () =>
    import("./delete-dialog").then((mod) => ({
      default: mod.DeletePlaylistDialog,
    })),
  {
    loading: () => (
      <DropdownMenuItem disabled variant="destructive">
        <TrashIcon />
        Delete
      </DropdownMenuItem>
    ),
  },
);

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
