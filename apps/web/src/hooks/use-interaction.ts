"use client";

import { useOptimistic, useTransition } from "react";
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

  function handleLike() {
    startTransition(async () => {
      if (optimisticLiked) {
        setOptimisticLiked(false);
        if (likeRkey) {
          await unlikeAction(likeRkey, author);
        }
      } else {
        if (!cid) return;
        setOptimisticLiked(true);
        await likeAction(uri, cid, author);
      }
    });
  }

  function handleRepost() {
    startTransition(async () => {
      if (optimisticReposted) {
        setOptimisticReposted(false);
        if (repostRkey) {
          await unrepostAction(repostRkey, author);
        }
      } else {
        if (!cid) return;
        setOptimisticReposted(true);
        await repostAction(uri, cid, author);
      }
    });
  }

  return { optimisticLiked, optimisticReposted, handleLike, handleRepost };
}
