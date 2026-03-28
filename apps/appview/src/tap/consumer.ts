import { TapChannel, SimpleIndexer } from "@atproto/tap";
import type { RecordEvent, IdentityEvent } from "@atproto/tap";
import { AtUri } from "@atproto/syntax";
import type { Kysely } from "kysely";
import type { DatabaseSchema } from "../db/schema.js";
import type { IdentityResolver } from "../identity/resolver.js";
import { COLLECTIONS, getCreatedAtFromRkey } from "common";

const SONG = COLLECTIONS.song;
const LIKE = COLLECTIONS.like;
const REPOST = COLLECTIONS.repost;
const COMMENT = COLLECTIONS.comment;

export async function handleSong(
  evt: RecordEvent,
  db: Kysely<DatabaseSchema>,
  resolver: IdentityResolver,
): Promise<void> {
  const uri = AtUri.make(evt.did, evt.collection, evt.rkey).toString();

  if (evt.action === "delete") {
    await db.deleteFrom("song").where("uri", "=", uri).execute();
    return;
  }

  if (!evt.record || !evt.cid) return;

  const identity = await resolver.resolve(evt.did);
  if (!identity) {
    console.warn(
      `Could not resolve identity for ${evt.did}, skipping song ${uri}`,
    );
    return;
  }

  await db
    .insertInto("song")
    .values({
      uri,
      cid: evt.cid,
      did: evt.did,
      rkey: evt.rkey,
      record: JSON.stringify(evt.record),
      indexed_at: new Date().toISOString(),
      created_at: getCreatedAtFromRkey(evt.rkey),
    })
    .onConflict((oc) =>
      oc.column("uri").doUpdateSet({
        cid: evt.cid!,
        record: JSON.stringify(evt.record),
        indexed_at: new Date().toISOString(),
        created_at:
          (evt.record!["createdAt"] as string) ??
          getCreatedAtFromRkey(evt.rkey),
      }),
    )
    .execute();
}

export async function handleLike(
  evt: RecordEvent,
  db: Kysely<DatabaseSchema>,
): Promise<void> {
  const uri = AtUri.make(evt.did, evt.collection, evt.rkey).toString();

  if (evt.action === "delete") {
    await db.deleteFrom("like").where("uri", "=", uri).execute();
    return;
  }

  if (!evt.record || !evt.cid) return;

  const subject = evt.record["subject"] as { uri: string } | undefined;
  if (!subject?.uri) return;

  await db
    .insertInto("like")
    .values({
      uri,
      did: evt.did,
      rkey: evt.rkey,
      subject_uri: subject.uri,
      created_at: getCreatedAtFromRkey(evt.rkey),
    })
    .onConflict((oc) => oc.column("uri").doNothing())
    .execute();
}

export async function handleRepost(
  evt: RecordEvent,
  db: Kysely<DatabaseSchema>,
): Promise<void> {
  const uri = AtUri.make(evt.did, evt.collection, evt.rkey).toString();

  if (evt.action === "delete") {
    await db.deleteFrom("repost").where("uri", "=", uri).execute();
    return;
  }

  if (!evt.record || !evt.cid) return;

  const subject = evt.record["subject"] as { uri: string } | undefined;
  if (!subject?.uri) return;

  await db
    .insertInto("repost")
    .values({
      uri,
      did: evt.did,
      rkey: evt.rkey,
      subject_uri: subject.uri,
      created_at: getCreatedAtFromRkey(evt.rkey),
    })
    .onConflict((oc) => oc.column("uri").doNothing())
    .execute();
}

export async function handleComment(
  evt: RecordEvent,
  db: Kysely<DatabaseSchema>,
): Promise<void> {
  const uri = AtUri.make(evt.did, evt.collection, evt.rkey).toString();

  if (evt.action === "delete") {
    await db
      .updateTable("comment")
      .set({ deleted: 1, text: "" })
      .where("uri", "=", uri)
      .execute();
    return;
  }

  if (!evt.record || !evt.cid) return;

  const reply = evt.record["reply"] as
    | {
        root?: { uri: string; cid?: string };
        parent?: { uri: string; cid?: string };
      }
    | undefined;
  const text = evt.record["text"] as string | undefined;
  if (!reply?.root?.uri || !reply?.parent?.uri || !text) return;

  await db
    .insertInto("comment")
    .values({
      uri,
      cid: evt.cid,
      did: evt.did,
      rkey: evt.rkey,
      subject_uri: reply.root.uri,
      parent_uri: reply.parent.uri,
      parent_cid: reply.parent.cid ?? "",
      text,
      created_at: getCreatedAtFromRkey(evt.rkey),
      deleted: 0,
    })
    .onConflict((oc) => oc.column("uri").doNothing())
    .execute();
}

interface TapConsumerDeps {
  db: Kysely<DatabaseSchema>;
  resolver: IdentityResolver;
  tapUrl: string;
  tapAdminPassword: string | undefined;
}

function buildTapWsUrl(tapUrl: string): string {
  const url = new URL(tapUrl);
  if (url.protocol === "http:") url.protocol = "ws:";
  else if (url.protocol === "https:") url.protocol = "wss:";
  url.pathname = "/channel";
  return url.toString();
}

export function createTapConsumer(deps: TapConsumerDeps): { start(): void } {
  const { db, resolver, tapUrl, tapAdminPassword } = deps;

  return {
    start() {
      const indexer = new SimpleIndexer();

      indexer
        .record(async (evt) => {
          try {
            if (evt.collection === SONG) {
              await handleSong(evt, db, resolver);
            } else if (evt.collection === LIKE) {
              await handleLike(evt, db);
            } else if (evt.collection === REPOST) {
              await handleRepost(evt, db);
            } else if (evt.collection === COMMENT) {
              await handleComment(evt, db);
            }
          } catch (err) {
            console.error(`Error handling ${evt.collection} event:`, err);
          }
        })
        .identity(async (evt: IdentityEvent) => {
          try {
            await resolver.upsertFromEvent(evt.did, evt.handle, evt.status);
          } catch (err) {
            console.error("Error handling identity event:", err);
          }
        })
        .error((err) => {
          console.error("Tap consumer error:", err);
        });

      const wsUrl = buildTapWsUrl(tapUrl);
      const channel = new TapChannel(wsUrl, indexer, {
        adminPassword: tapAdminPassword,
      });
      channel.start().catch((err) => {
        console.error("Tap channel ended:", err);
      });

      console.log(`Tap consumer started, connecting to ${wsUrl}`);
    },
  };
}
