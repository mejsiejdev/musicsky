"use client";

import { deleteSong } from "@/components/song/actions";
import { ConfirmDeleteDialog } from "../ui/confirm-delete-dialog";
import type { ActionResult } from "@/lib/action-result";

export function DeleteDialog({ rkey }: { rkey: string }) {
  return (
    <ConfirmDeleteDialog
      title="Delete song"
      description="Are you sure you want to delete this song?"
      action={async (prevState: ActionResult | null, formData: FormData) => {
        formData.set("rkey", rkey);
        return deleteSong(prevState, formData);
      }}
    />
  );
}
