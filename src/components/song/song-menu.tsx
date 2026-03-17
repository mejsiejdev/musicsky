"use client";

import { startTransition, useActionState } from "react";
import { EllipsisIcon, ListXIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "./delete-dialog";
import { EditDialog } from "./edit-dialog";
import { AddToPlaylistDialog } from "@/components/playlist/add-to-playlist-dialog";
import { removeTrackFromPlaylist } from "@/components/playlist/actions";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SongMenu({
  isOwner,
  loggedIn,
  rkey,
  uri,
  cid,
  title,
  description,
  genre,
  coverArt,
  playlistRkey,
  isLastTrack,
}: {
  isOwner: boolean;
  loggedIn: boolean;
  rkey: string;
  uri: string;
  cid: string | undefined;
  title: string;
  description: string | null;
  genre: string | null;
  coverArt: string;
  playlistRkey?: string;
  isLastTrack?: boolean;
}) {
  const [, removeAction, _removePending] = useActionState(
    async (
      prevState: { success?: boolean; error?: string } | null,
      formData: FormData,
    ) => {
      const result = await removeTrackFromPlaylist(prevState, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Removed from playlist");
      }
      return result;
    },
    null,
  );

  const hasPlaylistActions = loggedIn && !!cid;
  if (!isOwner && !hasPlaylistActions && !playlistRkey) {
    return null;
  }

  function handleRemoveFromPlaylist() {
    if (!playlistRkey) return;
    const formData = new FormData();
    formData.set("rkey", playlistRkey);
    formData.set("trackUri", uri);
    startTransition(() => {
      removeAction(formData);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-1 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label="Song options"
        >
          <EllipsisIcon size={18} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {loggedIn && cid && (
          <AddToPlaylistDialog trackUri={uri} trackCid={cid} />
        )}
        {playlistRkey &&
          (isLastTrack ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem disabled>
                  <ListXIcon size={16} />
                  Remove from playlist
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>Delete the playlist instead</TooltipContent>
            </Tooltip>
          ) : (
            <DropdownMenuItem onClick={handleRemoveFromPlaylist}>
              <ListXIcon size={16} />
              Remove from playlist
            </DropdownMenuItem>
          ))}
        {isOwner && (
          <>
            <EditDialog
              rkey={rkey}
              title={title}
              description={description}
              genre={genre}
              coverArt={coverArt}
            />
            <DeleteDialog rkey={rkey} />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
