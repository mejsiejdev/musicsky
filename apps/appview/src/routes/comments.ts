import type { Request, Response } from "express";
import { getDb } from "../db/index.js";
import type { CommentsOutput, CommentView } from "../types/comments.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function getCommentsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const uri = req.query["uri"] as string | undefined;

  if (!uri) {
    res.status(400).json({ error: "Missing required parameter: uri" });
    return;
  }

  const limit = Math.min(
    parseInt(req.query["limit"] as string) || DEFAULT_LIMIT,
    MAX_LIMIT,
  );
  const cursor = req.query["cursor"] as string | undefined;
  const viewer = req.query["viewer"] as string | undefined;

  const db = getDb();

  let query = db
    .selectFrom("comment as c")
    .innerJoin("identity as i", "i.did", "c.did")
    .select([
      "c.uri",
      "c.cid",
      "c.did",
      "c.text",
      "c.created_at",
      "c.parent_uri",
      "c.parent_cid",
      "c.subject_uri",
      "c.deleted",
      "i.handle",
      "i.pds",
    ])
    .where("c.subject_uri", "=", uri);

  if (cursor) {
    const [cursorTs, cursorUri] = cursor.split("::");
    if (cursorTs && cursorUri) {
      query = query.where((eb) =>
        eb.or([
          eb("c.created_at", "<", cursorTs),
          eb.and([
            eb("c.created_at", "=", cursorTs),
            eb("c.uri", "<", cursorUri),
          ]),
        ]),
      );
    }
  }

  const [rows, countResult] = await Promise.all([
    query
      .orderBy("c.created_at", "desc")
      .orderBy("c.uri", "desc")
      .limit(limit)
      .execute(),
    db
      .selectFrom("comment")
      .select((eb) => eb.fn.count<number>("uri").as("count"))
      .where("subject_uri", "=", uri)
      .where("deleted", "=", 0)
      .executeTakeFirstOrThrow(),
  ]);

  const totalCount = Number(countResult.count);

  const commentUris = rows.map((row) => row.uri);

  const [likeCounts, viewerLikes] = await Promise.all([
    commentUris.length > 0
      ? db
          .selectFrom("like")
          .select(["subject_uri"])
          .select((eb) => eb.fn.count<number>("uri").as("count"))
          .where("subject_uri", "in", commentUris)
          .groupBy("subject_uri")
          .execute()
      : Promise.resolve([]),
    commentUris.length > 0 && viewer
      ? db
          .selectFrom("like")
          .select(["subject_uri", "uri"])
          .where("did", "=", viewer)
          .where("subject_uri", "in", commentUris)
          .execute()
      : Promise.resolve([]),
  ]);

  const likeCountMap = new Map<string, number>(
    likeCounts.map((row) => [row.subject_uri, Number(row.count)]),
  );
  const viewerLikeMap = new Map<string, string>(
    viewerLikes.map((row) => [row.subject_uri, row.uri]),
  );

  const comments: CommentView[] = rows.map((row) => {
    const isReply = row.parent_uri !== row.subject_uri;

    const comment: CommentView = {
      uri: row.uri,
      cid: row.cid,
      text: row.deleted ? "" : row.text,
      author: {
        did: row.did,
        handle: row.handle,
        pds: row.pds,
      },
      createdAt: row.created_at,
    };

    if (isReply) {
      comment.parent = { uri: row.parent_uri, cid: row.parent_cid };
    }
    if (row.deleted) {
      comment.deleted = true;
    }
    if (likeCountMap.has(row.uri)) {
      comment.likeCount = likeCountMap.get(row.uri);
    }
    if (viewer) {
      comment.viewer = { like: viewerLikeMap.get(row.uri) };
    }

    return comment;
  });

  const lastRow = rows[rows.length - 1];
  const nextCursor = lastRow
    ? `${lastRow.created_at}::${lastRow.uri}`
    : undefined;

  res.json({ cursor: nextCursor, totalCount, comments } satisfies CommentsOutput);
}
