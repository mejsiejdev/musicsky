"use server";

import { Agent } from "@atproto/api";
import { getSession } from "@/lib/auth/session";
import { revalidatePath, updateTag } from "next/cache";

export async function likeAction(uri: string, cid: string, handle: string) {
  const session = await getSession();
  if (!session) return;

  const agent = new Agent(session);
  const result = await agent.com.atproto.repo.createRecord({
    repo: agent.assertDid,
    collection: "app.musicsky.temp.like",
    record: {
      $type: "app.musicsky.temp.like",
      subject: { uri, cid },
      createdAt: new Date().toISOString(),
    },
  });
  revalidatePath(`/${handle}`);
  updateTag(`likes-${agent.assertDid}`);
  return result.data.uri.split("/").at(-1);
}

export async function unlikeAction(rkey: string, handle: string) {
  const session = await getSession();
  if (!session) return;

  const agent = new Agent(session);
  await agent.com.atproto.repo.deleteRecord({
    repo: agent.assertDid,
    collection: "app.musicsky.temp.like",
    rkey,
  });
  revalidatePath(`/${handle}`);
  updateTag(`likes-${agent.assertDid}`);
}

export async function repostAction(uri: string, cid: string, handle: string) {
  const session = await getSession();
  if (!session) return;

  const agent = new Agent(session);
  const result = await agent.com.atproto.repo.createRecord({
    repo: agent.assertDid,
    collection: "app.musicsky.temp.repost",
    record: {
      $type: "app.musicsky.temp.repost",
      subject: { uri, cid },
      createdAt: new Date().toISOString(),
    },
  });
  revalidatePath(`/${handle}`);
  return result.data.uri.split("/").at(-1);
}

export async function unrepostAction(rkey: string, handle: string) {
  const session = await getSession();
  if (!session) return;

  const agent = new Agent(session);
  await agent.com.atproto.repo.deleteRecord({
    repo: agent.assertDid,
    collection: "app.musicsky.temp.repost",
    rkey,
  });
  revalidatePath(`/${handle}`);
}
