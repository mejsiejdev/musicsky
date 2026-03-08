"use server";

import { Agent } from "@atproto/api";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function likeAction(uri: string, cid: string, handle: string) {
  const session = await getSession();
  if (!session) return;

  const agent = new Agent(session);
  await agent.com.atproto.repo.createRecord({
    repo: agent.assertDid,
    collection: "app.musicsky.temp.like",
    record: {
      $type: "app.musicsky.temp.like",
      subject: { uri, cid },
      createdAt: new Date().toISOString(),
    },
  });
  revalidatePath(`/${handle}`);
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
}

export async function repostAction(uri: string, cid: string, handle: string) {
  const session = await getSession();
  if (!session) return;

  const agent = new Agent(session);
  await agent.com.atproto.repo.createRecord({
    repo: agent.assertDid,
    collection: "app.musicsky.temp.repost",
    record: {
      $type: "app.musicsky.temp.repost",
      subject: { uri, cid },
      createdAt: new Date().toISOString(),
    },
  });
  revalidatePath(`/${handle}`);
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
