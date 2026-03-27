"use server";

import { Agent } from "@atproto/api";
import { updateTag } from "next/cache";
import { COLLECTIONS } from "@/lib/atproto";
import { type ActionResult, ok, fail } from "@/lib/action-result";
import { requireSession } from "@/lib/repo";

export async function createComment(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const text = (formData.get("text") as string).trim();
  const trackUri = formData.get("trackUri") as string;
  const trackCid = formData.get("trackCid") as string;

  if (!text || text.length === 0) {
    return fail(new Error("Comment cannot be empty."));
  }

  if (text.length > 300) {
    return fail(new Error("Comment must be 300 characters or fewer."));
  }

  if (!trackUri || !trackCid) {
    return fail(new Error("Missing track reference."));
  }

  const session = await requireSession();
  const agent = new Agent(session);

  try {
    const trackRef = { uri: trackUri, cid: trackCid };

    await agent.com.atproto.repo.createRecord({
      repo: agent.assertDid,
      collection: COLLECTIONS.comment,
      record: {
        $type: COLLECTIONS.comment,
        text,
        reply: {
          root: trackRef,
          parent: trackRef,
        },
        createdAt: new Date().toISOString(),
      },
    });

    updateTag(`comments-${trackUri}`);
    return ok();
  } catch (error) {
    console.error("Failed to create comment:", error);
    return fail(error);
  }
}
