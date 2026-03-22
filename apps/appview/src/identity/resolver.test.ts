import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Kysely } from "kysely";
import type { DatabaseSchema } from "../db/schema.js";
import { createIdentityResolver } from "./resolver.js";
import { createTestDb } from "../tests/helpers/db.js";

// Mock the common package's network functions
vi.mock("common", () => ({
  getPds: vi.fn(),
  getHandleFromDid: vi.fn(),
}));

import { getPds, getHandleFromDid } from "common";

const mockGetPds = vi.mocked(getPds);
const mockGetHandleFromDid = vi.mocked(getHandleFromDid);

describe("IdentityResolver", () => {
  let db: Kysely<DatabaseSchema>;

  beforeEach(async () => {
    db = await createTestDb();
    vi.clearAllMocks();
  });

  describe("resolve", () => {
    it("resolves from network on cache miss and persists to DB", async () => {
      mockGetPds.mockResolvedValue("https://pds.example.com");
      mockGetHandleFromDid.mockResolvedValue("alice.test");

      const resolver = createIdentityResolver(db);
      const result = await resolver.resolve("did:plc:abc");

      expect(result).toEqual({
        handle: "alice.test",
        pds: "https://pds.example.com",
      });
      expect(mockGetPds).toHaveBeenCalledWith("did:plc:abc");
      expect(mockGetHandleFromDid).toHaveBeenCalledWith(
        "did:plc:abc",
        "https://pds.example.com",
      );

      // Verify persisted to DB
      const row = await db
        .selectFrom("identity")
        .selectAll()
        .where("did", "=", "did:plc:abc")
        .executeTakeFirst();
      expect(row?.handle).toBe("alice.test");
      expect(row?.pds).toBe("https://pds.example.com");
    });

    it("returns cached identity without calling network", async () => {
      // Seed the DB
      await db
        .insertInto("identity")
        .values({
          did: "did:plc:cached",
          handle: "bob.test",
          pds: "https://pds.cached.com",
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .execute();

      const resolver = createIdentityResolver(db);
      const result = await resolver.resolve("did:plc:cached");

      expect(result).toEqual({
        handle: "bob.test",
        pds: "https://pds.cached.com",
      });
      expect(mockGetPds).not.toHaveBeenCalled();
      expect(mockGetHandleFromDid).not.toHaveBeenCalled();
    });

    it("returns null when PDS cannot be resolved", async () => {
      mockGetPds.mockResolvedValue(null);

      const resolver = createIdentityResolver(db);
      const result = await resolver.resolve("did:plc:unknown");

      expect(result).toBeNull();
    });
  });

  describe("resolvePds", () => {
    it("throws when PDS cannot be resolved", async () => {
      mockGetPds.mockResolvedValue(null);

      const resolver = createIdentityResolver(db);

      await expect(resolver.resolvePds("did:plc:unknown")).rejects.toThrow(
        "Could not resolve PDS for did:plc:unknown",
      );
    });

    it("returns cached PDS without network call", async () => {
      await db
        .insertInto("identity")
        .values({
          did: "did:plc:cached",
          handle: "bob.test",
          pds: "https://pds.cached.com",
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .execute();

      const resolver = createIdentityResolver(db);
      const pds = await resolver.resolvePds("did:plc:cached");

      expect(pds).toBe("https://pds.cached.com");
      expect(mockGetPds).not.toHaveBeenCalled();
    });
  });

  describe("upsertFromEvent", () => {
    it("does not clobber existing PDS", async () => {
      // Seed with a fully resolved identity
      await db
        .insertInto("identity")
        .values({
          did: "did:plc:full",
          handle: "alice.test",
          pds: "https://pds.example.com",
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .execute();

      const resolver = createIdentityResolver(db);
      await resolver.upsertFromEvent(
        "did:plc:full",
        "alice-new.test",
        "active",
      );

      const row = await db
        .selectFrom("identity")
        .selectAll()
        .where("did", "=", "did:plc:full")
        .executeTakeFirst();

      expect(row?.handle).toBe("alice-new.test");
      expect(row?.pds).toBe("https://pds.example.com"); // PDS preserved
    });

    it("inserts new identity from event", async () => {
      const resolver = createIdentityResolver(db);
      await resolver.upsertFromEvent("did:plc:new", "newuser.test", "active");

      const row = await db
        .selectFrom("identity")
        .selectAll()
        .where("did", "=", "did:plc:new")
        .executeTakeFirst();

      expect(row?.handle).toBe("newuser.test");
      expect(row?.pds).toBe(""); // No PDS from TAP event
      expect(row?.status).toBe("active");
    });
  });
});
