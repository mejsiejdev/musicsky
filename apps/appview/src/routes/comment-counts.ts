import type { Request, Response } from "express";
import { getDb } from "../db/index.js";

const MAX_URIS = 100;

export async function getCommentCountsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const urisParam = req.query["uris"] as string | undefined;

  if (!urisParam) {
    res.status(400).json({ error: "Missing required parameter: uris" });
    return;
  }

  const uris = urisParam.split(",").slice(0, MAX_URIS);

  if (uris.length === 0) {
    res.json({ counts: {} });
    return;
  }

  const db = getDb();

  const rows = await db
    .selectFrom("comment")
    .select(["subject_uri"])
    .select((eb) => eb.fn.count<number>("uri").as("count"))
    .where("subject_uri", "in", uris)
    .where("deleted", "=", 0)
    .groupBy("subject_uri")
    .execute();

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.subject_uri] = Number(row.count);
  }

  res.json({ counts });
}
