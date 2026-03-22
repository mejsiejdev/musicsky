import type { Request, Response } from "express";
import { getDb } from "../db/index.js";
import type { FeedOutput, SongView } from "../types/feed.js";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function getFeedHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const limit = Math.min(
    parseInt(req.query["limit"] as string) || DEFAULT_LIMIT,
    MAX_LIMIT,
  );
  const cursor = req.query["cursor"] as string | undefined;
  const viewer = req.query["viewer"] as string | undefined;

  const db = getDb();

  let query = db
    .selectFrom("song as s")
    .innerJoin("identity as i", "i.did", "s.did")
    .select([
      "s.uri",
      "s.cid",
      "s.did",
      "s.rkey",
      "s.record",
      "s.created_at",
      "s.indexed_at",
      "i.handle",
      "i.pds",
    ]);

  if (cursor) {
    const [cursorTs, cursorUri] = cursor.split("::");
    if (cursorTs && cursorUri) {
      query = query.where((eb) =>
        eb.or([
          eb("s.created_at", "<", cursorTs),
          eb.and([
            eb("s.created_at", "=", cursorTs),
            eb("s.uri", "<", cursorUri),
          ]),
        ]),
      );
    }
  }

  const rows = await query
    .orderBy("s.created_at", "desc")
    .orderBy("s.uri", "desc")
    .limit(limit)
    .execute();

  if (rows.length === 0) {
    res.json({ songs: [] } satisfies FeedOutput);
    return;
  }

  const uris = rows.map((r) => r.uri);

  const viewerLikes = new Map<string, string>();
  const viewerReposts = new Map<string, string>();

  if (viewer) {
    const [likes, reposts] = await Promise.all([
      db
        .selectFrom("like")
        .select(["uri", "subject_uri"])
        .where("did", "=", viewer)
        .where("subject_uri", "in", uris)
        .execute(),
      db
        .selectFrom("repost")
        .select(["uri", "subject_uri"])
        .where("did", "=", viewer)
        .where("subject_uri", "in", uris)
        .execute(),
    ]);
    for (const l of likes) viewerLikes.set(l.subject_uri, l.uri);
    for (const r of reposts) viewerReposts.set(r.subject_uri, r.uri);
  }

  const [likeCounts, repostCounts] = await Promise.all([
    db
      .selectFrom("like")
      .select(["subject_uri"])
      .select((eb) => eb.fn.count<number>("uri").as("count"))
      .where("subject_uri", "in", uris)
      .groupBy("subject_uri")
      .execute(),
    db
      .selectFrom("repost")
      .select(["subject_uri"])
      .select((eb) => eb.fn.count<number>("uri").as("count"))
      .where("subject_uri", "in", uris)
      .groupBy("subject_uri")
      .execute(),
  ]);

  const likeCountMap = new Map(
    likeCounts.map((r) => [r.subject_uri, Number(r.count)]),
  );
  const repostCountMap = new Map(
    repostCounts.map((r) => [r.subject_uri, Number(r.count)]),
  );

  const songs: SongView[] = rows.map((row) => ({
    uri: row.uri,
    cid: row.cid,
    author: {
      did: row.did,
      handle: row.handle,
      pds: row.pds,
    },
    record: JSON.parse(row.record) as unknown,
    likeCount: likeCountMap.get(row.uri) ?? 0,
    repostCount: repostCountMap.get(row.uri) ?? 0,
    viewer: viewer
      ? {
          like: viewerLikes.get(row.uri),
          repost: viewerReposts.get(row.uri),
        }
      : undefined,
    indexedAt: row.indexed_at,
    createdAt: row.created_at,
  }));

  const lastRow = rows[rows.length - 1];
  const nextCursor = lastRow
    ? `${lastRow.created_at}::${lastRow.uri}`
    : undefined;

  res.json({ cursor: nextCursor, songs } satisfies FeedOutput);
}
