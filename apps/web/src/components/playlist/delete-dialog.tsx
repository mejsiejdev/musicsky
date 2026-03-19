"use client";

import { deletePlaylist } from "./actions";
import { ConfirmDeleteDialog } from "../ui/confirm-delete-dialog";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/action-result";

export function DeletePlaylistDialog({
  rkey,
  author,
}: {
  rkey: string;
  author: string;
}) {
  const router = useRouter();

  return (
    <ConfirmDeleteDialog
      title="Delete playlist"
      description="Are you sure you want to delete this playlist?"
      action={async (prevState: ActionResult | null, formData: FormData) => {
        formData.set("rkey", rkey);
        return deletePlaylist(prevState, formData);
      }}
      onSuccess={() => router.push(`/${author}/playlists`)}
    />
  );
}
