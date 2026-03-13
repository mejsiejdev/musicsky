"use client";

import { EllipsisIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "./delete-dialog";
import { EditDialog } from "./edit-dialog";

export function SongMenu({
  isOwner,
  rkey,
  title,
  description,
  genre,
}: {
  isOwner: boolean;
  rkey: string;
  title: string;
  description: string | null;
  genre: string | null;
}) {
  /**
   * the menu for now does not have non-owner actions,
   * return nothing until they get added.
   */
  if (!isOwner) {
    return null;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <EllipsisIcon size={18} className="cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isOwner && (
          <>
            <EditDialog
              rkey={rkey}
              title={title}
              description={description}
              genre={genre}
            />
            <DeleteDialog rkey={rkey} />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
