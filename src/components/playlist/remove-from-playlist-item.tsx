"use client";

import { startTransition, useActionState } from "react";
import { ListXIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { removeTrackFromPlaylist } from "@/components/playlist/actions";
import type { ActionResult } from "@/lib/action-result";
import { toast } from "sonner";

export function RemoveFromPlaylistItem({
  playlistRkey,
  trackUri,
  isLastTrack,
}: {
  playlistRkey: string;
  trackUri: string;
  isLastTrack?: boolean;
}) {
  const [, removeAction] = useActionState(
    async (prevState: ActionResult | null, formData: FormData) => {
      const result = await removeTrackFromPlaylist(prevState, formData);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("Removed from playlist");
      }
      return result;
    },
    null,
  );

  function handleRemove() {
    const formData = new FormData();
    formData.set("rkey", playlistRkey);
    formData.set("trackUri", trackUri);
    startTransition(() => {
      removeAction(formData);
    });
  }

  if (isLastTrack) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuItem disabled>
            <ListXIcon size={16} />
            Remove from playlist
          </DropdownMenuItem>
        </TooltipTrigger>
        <TooltipContent>Delete the playlist instead</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenuItem onClick={handleRemove}>
      <ListXIcon size={16} />
      Remove from playlist
    </DropdownMenuItem>
  );
}
