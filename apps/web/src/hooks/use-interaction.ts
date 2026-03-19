"use client";

import { useOptimistic, useTransition } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { getRkeyFromUri } from "@/lib/atproto";
import {
  likeAction,
  unlikeAction,
  repostAction,
  unrepostAction,
} from "@/components/song/interaction-actions";

interface UseInteractionOptions {
  uri: string;
  cid?: string;
  author: string;
  likeRkey: string | null;
  repostRkey: string | null;
}

export function useInteraction({
  uri,
  cid,
  author,
  likeRkey,
  repostRkey,
}: UseInteractionOptions) {
  const [, startTransition] = useTransition();
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(
    likeRkey !== null,
  );
  const [optimisticReposted, setOptimisticReposted] = useOptimistic(
    repostRkey !== null,
  );
  const currentSong = usePlayerStore((store) => store.currentSong);
  const isCurrentSong = currentSong?.rkey === getRkeyFromUri(uri);

  function handleLike() {
    startTransition(async () => {
      if (optimisticLiked) {
        setOptimisticLiked(false);
        if (likeRkey) {
          await unlikeAction(likeRkey, author);
          if (isCurrentSong) usePlayerStore.getState().setLikeRkey(null);
        }
      } else {
        if (!cid) return;
        setOptimisticLiked(true);
        const newRkey = await likeAction(uri, cid, author);
        if (isCurrentSong)
          usePlayerStore.getState().setLikeRkey(newRkey ?? null);
      }
    });
  }

  function handleRepost() {
    startTransition(async () => {
      if (optimisticReposted) {
        setOptimisticReposted(false);
        if (repostRkey) {
          await unrepostAction(repostRkey, author);
          if (isCurrentSong) usePlayerStore.getState().setRepostRkey(null);
        }
      } else {
        if (!cid) return;
        setOptimisticReposted(true);
        const newRkey = await repostAction(uri, cid, author);
        if (isCurrentSong)
          usePlayerStore.getState().setRepostRkey(newRkey ?? null);
      }
    });
  }

  return { optimisticLiked, optimisticReposted, handleLike, handleRepost };
}
