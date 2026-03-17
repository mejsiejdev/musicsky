"use client";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { Loader2Icon, TrashIcon } from "lucide-react";
import { deletePlaylist } from "./actions";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

export function DeletePlaylistDialog({
  rkey,
  author,
}: {
  rkey: string;
  author: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (
      prevState: { success?: boolean; error?: string } | null,
      formData: FormData,
    ) => {
      const result = await deletePlaylist(prevState, formData);
      if (result.success) {
        setOpen(false);
        router.push(`/${author}/playlists`);
      }
      return result;
    },
    null,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(event) => event.preventDefault()}
          variant="destructive"
        >
          <TrashIcon />
          Delete
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete playlist</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this playlist?
          </DialogDescription>
        </DialogHeader>
        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <form action={action}>
            <input type="hidden" name="rkey" value={rkey} />
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
