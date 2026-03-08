"use client";

import { EllipsisIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "./delete-dialog";

export function SongMenu({
  isOwner,
  rkey,
}: {
  isOwner: boolean;
  rkey: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <EllipsisIcon size={18} className="cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isOwner && <DeleteDialog rkey={rkey} />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
