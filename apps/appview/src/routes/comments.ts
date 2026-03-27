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
      .executeTakeFirstOrThrow(),
  ]);

  const totalCount = Number(countResult.count);

  const comments: CommentView[] = rows.map((row) => ({
    uri: row.uri,
    cid: row.cid,
    text: row.text,
    author: {
      did: row.did,
      handle: row.handle,
      pds: row.pds,
    },
    createdAt: row.created_at,
  }));

  const lastRow = rows[rows.length - 1];
  const nextCursor = lastRow
    ? `${lastRow.created_at}::${lastRow.uri}`
    : undefined;

  res.json({ cursor: nextCursor, totalCount, comments } satisfies CommentsOutput);
}
