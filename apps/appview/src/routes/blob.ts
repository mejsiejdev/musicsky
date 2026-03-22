import type { Request, Response } from "express";
import type { IdentityResolver } from "../identity/resolver.js";

export function createBlobHandler(resolver: IdentityResolver) {
  return async function blobHandler(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { did, cid } = req.params as { did: string; cid: string };

    if (!did || !cid) {
      res.status(400).json({ error: "Missing did or cid" });
      return;
    }

    let pds: string;
    try {
      pds = await resolver.resolvePds(did);
    } catch {
      res.status(404).json({ error: "Could not resolve PDS for DID" });
      return;
    }

    const blobUrl = `${pds}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`;

    try {
      const upstream = await fetch(blobUrl);

      if (!upstream.ok) {
        res.status(upstream.status).json({ error: "Blob not found" });
        return;
      }

      const contentType = upstream.headers.get("content-type");
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

      const body = upstream.body;
      if (!body) {
        res.status(502).json({ error: "Empty response from PDS" });
        return;
      }

      // Stream the response
      const reader = body.getReader();
      const pump = async (): Promise<void> => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(value);
        return pump();
      };
      await pump();
    } catch (err) {
      console.error("Blob proxy error:", err);
      res.status(502).json({ error: "Failed to fetch blob from PDS" });
    }
  };
}
