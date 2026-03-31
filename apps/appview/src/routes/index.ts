import type { Express } from "express";
import type { IdentityResolver } from "../identity/resolver.js";
import { getFeedHandler } from "./feed.js";
import { getCommentsHandler } from "./comments.js";
import { getCommentCountsHandler } from "./comment-counts.js";
import { createBlobHandler } from "./blob.js";

export function registerRoutes(app: Express, resolver: IdentityResolver): void {
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/xrpc/app.musicsky.temp.getFeed", (req, res) => {
    getFeedHandler(req, res).catch((err) => {
      console.error("getFeed error:", err);
      res.status(500).json({ error: "Internal server error" });
    });
  });

  app.get("/xrpc/app.musicsky.temp.getComments", (req, res) => {
    getCommentsHandler(req, res).catch((err) => {
      console.error("getComments error:", err);
      res.status(500).json({ error: "Internal server error" });
    });
  });

  app.get("/xrpc/app.musicsky.temp.getCommentCounts", (req, res) => {
    getCommentCountsHandler(req, res).catch((err) => {
      console.error("getCommentCounts error:", err);
      res.status(500).json({ error: "Internal server error" });
    });
  });

  const blobHandler = createBlobHandler(resolver);
  app.get("/blob/:did/:cid", (req, res) => {
    blobHandler(req, res).catch((err) => {
      console.error("blob error:", err);
      res.status(500).json({ error: "Internal server error" });
    });
  });
}
