"use server";

import { Agent } from "@atproto/api";
import { getSession } from "@/lib/auth/session";
import { revalidatePath, updateTag } from "next/cache";
import { getRkeyFromUri, COLLECTIONS } from "@/lib/atproto";

export async function likeAction(uri: string, cid: string, handle: string) {
  const session = await getSession();
  if (!session) return;

  const agent = new Agent(session);
  const result = await agent.com.atproto.repo.createRecord({
    repo: agent.assertDid,
    collection: COLLECTIONS.like,
    record: {
      $type: COLLECTIONS.like,
      subject: { uri, cid },
      createdAt: new Date().toISOString(),
    },
  });
  revalidatePath(`/${handle}`);
  updateTag(`likes-${agent.assertDid}`);
  return getRkeyFromUri(result.data.uri);
}

export async function unlikeAction(rkey: string, handle: string) {
  const session = await getSession();
  if (!session) return;

  const agent = new Agent(session);
  await agent.com.atproto.repo.deleteRecord({
    repo: agent.assertDid,
    collection: COLLECTIONS.like,
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
    collection: COLLECTIONS.repost,
    record: {
      $type: COLLECTIONS.repost,
      subject: { uri, cid },
      createdAt: new Date().toISOString(),
    },
  });
  revalidatePath(`/${handle}`);
  return getRkeyFromUri(result.data.uri);
}

export async function unrepostAction(rkey: string, handle: string) {
  const session = await getSession();
  if (!session) return;

  const agent = new Agent(session);
  await agent.com.atproto.repo.deleteRecord({
    repo: agent.assertDid,
    collection: COLLECTIONS.repost,
    rkey,
  });
  revalidatePath(`/${handle}`);
}
