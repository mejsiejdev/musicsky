"use server";

import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Agent } from "@atproto/api";

export async function deleteSong(rkey: string) {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }
  const agent = new Agent(session);
  try {
    await agent.com.atproto.repo.deleteRecord({
      repo: agent.assertDid,
      collection: "app.musicsky.temp.track",
      rkey,
    });
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
