"use client";

import { startTransition, useActionState, useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ListMusicIcon, Loader2Icon, PlusIcon, CheckIcon } from "lucide-react";
import {
  addTrackToPlaylist,
  createPlaylist,
  getUserPlaylistsAction,
} from "./actions";
import { toast } from "sonner";

export function AddToPlaylistDialog({
  trackUri,
  trackCid,
}: {
  trackUri: string;
  trackCid: string;
}) {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<{ rkey: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value);
    if (value) {
      setLoading(true);
      setShowNewInput(false);
      setNewName("");
      setError(null);
      getUserPlaylistsAction().then((result) => {
        setPlaylists(result);
        setLoading(false);
      });
    }
  }, []);

  const [, addAction, addPending] = useActionState(
    async (
      prevState: { success?: boolean; error?: string } | null,
      formData: FormData,
    ) => {
      const result = await addTrackToPlaylist(prevState, formData);
      if (result.success) {
        toast.success("Added to playlist");
        setOpen(false);
      } else if (result.error) {
        setError(result.error);
      }
      return result;
    },
    null,
  );

  const [, createAction, createPending] = useActionState(
    async (
      prevState: {
        success?: boolean;
        error?: string;
        rkey?: string;
      } | null,
      formData: FormData,
    ) => {
      const result = await createPlaylist(prevState, formData);
      if (result.success) {
        toast.success("Playlist created");
        setOpen(false);
      } else if (result.error) {
        setError(result.error);
      }
      return result;
    },
    null,
  );

  function handleAddToExisting(rkey: string) {
    const formData = new FormData();
    formData.set("rkey", rkey);
    formData.set("trackUri", trackUri);
    formData.set("trackCid", trackCid);
    startTransition(() => {
      addAction(formData);
    });
  }

  function handleCreateNew() {
    if (!newName.trim()) return;
    const formData = new FormData();
    formData.set("name", newName.trim());
    formData.set("trackUri", trackUri);
    formData.set("trackCid", trackCid);
    startTransition(() => {
      createAction(formData);
    });
  }

  const pending = addPending || createPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          <ListMusicIcon />
          Add to playlist
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to playlist</DialogTitle>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2Icon className="animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {showNewInput ? (
              <div className="flex flex-row gap-2">
                <Input
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="Playlist name"
                  autoFocus
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleCreateNew();
                    }
                  }}
                />
                <Button
                  onClick={handleCreateNew}
                  disabled={!newName.trim() || pending}
                  size="sm"
                >
                  {createPending ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <CheckIcon />
                  )}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowNewInput(true)}
                className="justify-start"
              >
                <PlusIcon />
                New playlist
              </Button>
            )}
            {playlists.map((playlist) => (
              <Button
                key={playlist.rkey}
                variant="ghost"
                onClick={() => handleAddToExisting(playlist.rkey)}
                disabled={pending}
                className="justify-start"
              >
                <ListMusicIcon />
                {playlist.name}
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
