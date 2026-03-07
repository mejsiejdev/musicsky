"use server";

import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Agent } from "@atproto/api";
import { updateTag } from "next/cache";

export async function deleteSong(
  _prevState: { success?: boolean; error?: string } | null,
  formData: FormData,
) {
  const rkey = formData.get("rkey") as string;
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }
  const agent = new Agent(session);
  try {
    await agent.com.atproto.repo.deleteRecord({
      repo: agent.assertDid,
      collection: "app.musicsky.temp.song",
      rkey,
    });
    updateTag(`songs-${agent.assertDid}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete song:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again.",
    };
  }
}
