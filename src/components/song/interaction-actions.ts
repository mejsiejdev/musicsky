"use server";

import { Agent } from "@atproto/api";
import { getSession } from "@/lib/auth/session";

export async function likeAction(uri: string, cid: string) {
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
}

export async function unlikeAction(rkey: string) {
  const session = await getSession();
  if (!session) return;

  const agent = new Agent(session);
  await agent.com.atproto.repo.deleteRecord({
    repo: agent.assertDid,
    collection: "app.musicsky.temp.like",
    rkey,
  });
}

export async function repostAction(uri: string, cid: string) {
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
}

export async function unrepostAction(rkey: string) {
  const session = await getSession();
  if (!session) return;

  const agent = new Agent(session);
  await agent.com.atproto.repo.deleteRecord({
    repo: agent.assertDid,
    collection: "app.musicsky.temp.repost",
    rkey,
  });
}
