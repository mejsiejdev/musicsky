import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Kysely } from "kysely";
import type { DatabaseSchema } from "../db/schema.js";
import type { IdentityResolver } from "../identity/resolver.js";
import { handleSong, handleLike, handleRepost } from "./consumer.js";
import { createTestDb } from "../tests/helpers/db.js";
import { COLLECTIONS } from "common";

vi.mock("common", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    getCreatedAtFromRkey: vi.fn(() => "2026-03-22T00:00:00.000Z"),
  };
});

function createFakeResolver(
  override?: Partial<IdentityResolver>,
): IdentityResolver {
  return {
    resolve: vi.fn(async () => ({
      handle: "alice.test",
      pds: "https://pds.test",
    })),
    resolvePds: vi.fn(async () => "https://pds.test"),
    upsertFromEvent: vi.fn(async () => {}),
    ...override,
  };
}

describe("handleSong", () => {
  let db: Kysely<DatabaseSchema>;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it("inserts a song on create", async () => {
    const resolver = createFakeResolver();

    await handleSong(
      {
        action: "create",
        did: "did:plc:abc",
        collection: COLLECTIONS.song,
        rkey: "3jui7kd2zcszw",
        cid: "bafyreiabc",
        record: { title: "Test Song", createdAt: "2026-03-22T00:00:00.000Z" },
      } as never,
      db,
      resolver,
    );

    const row = await db.selectFrom("song").selectAll().executeTakeFirst();
    expect(row).toBeDefined();
    expect(row?.did).toBe("did:plc:abc");
    expect(row?.cid).toBe("bafyreiabc");
    expect(resolver.resolve).toHaveBeenCalledWith("did:plc:abc");
  });

  it("deletes a song on delete", async () => {
    const resolver = createFakeResolver();

    // Seed a song
    await handleSong(
      {
        action: "create",
        did: "did:plc:abc",
        collection: COLLECTIONS.song,
        rkey: "3jui7kd2zcszw",
        cid: "bafyreiabc",
        record: { title: "Test Song" },
      } as never,
      db,
      resolver,
    );

    // Delete it
    await handleSong(
      {
        action: "delete",
        did: "did:plc:abc",
        collection: COLLECTIONS.song,
        rkey: "3jui7kd2zcszw",
      } as never,
      db,
      resolver,
    );

    const rows = await db.selectFrom("song").selectAll().execute();
    expect(rows).toHaveLength(0);
  });

  it("skips insert when identity cannot be resolved", async () => {
    const resolver = createFakeResolver({
      resolve: vi.fn(async () => null),
    });

    await handleSong(
      {
        action: "create",
        did: "did:plc:unknown",
        collection: COLLECTIONS.song,
        rkey: "3jui7kd2zcszw",
        cid: "bafyreiabc",
        record: { title: "Test Song" },
      } as never,
      db,
      resolver,
    );

    const rows = await db.selectFrom("song").selectAll().execute();
    expect(rows).toHaveLength(0);
  });
});

describe("handleLike", () => {
  let db: Kysely<DatabaseSchema>;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it("inserts a like", async () => {
    await handleLike(
      {
        action: "create",
        did: "did:plc:liker",
        collection: COLLECTIONS.like,
        rkey: "3jui7kd2zcszw",
        cid: "bafyreilike",
        record: {
          subject: {
            uri: "at://did:plc:abc/app.musicsky.temp.song/3jui7kd2zcszw",
          },
        },
      } as never,
      db,
    );

    const row = await db.selectFrom("like").selectAll().executeTakeFirst();
    expect(row).toBeDefined();
    expect(row?.did).toBe("did:plc:liker");
    expect(row?.subject_uri).toBe(
      "at://did:plc:abc/app.musicsky.temp.song/3jui7kd2zcszw",
    );
  });

  it("is idempotent — second insert with same URI is ignored", async () => {
    const evt = {
      action: "create",
      did: "did:plc:liker",
      collection: COLLECTIONS.like,
      rkey: "3jui7kd2zcszw",
      cid: "bafyreilike",
      record: {
        subject: {
          uri: "at://did:plc:abc/app.musicsky.temp.song/3jui7kd2zcszw",
        },
      },
    } as never;

    await handleLike(evt, db);
    await handleLike(evt, db);

    const rows = await db.selectFrom("like").selectAll().execute();
    expect(rows).toHaveLength(1);
  });
});

describe("handleRepost", () => {
  let db: Kysely<DatabaseSchema>;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it("inserts a repost and deletes it", async () => {
    await handleRepost(
      {
        action: "create",
        did: "did:plc:reposter",
        collection: COLLECTIONS.repost,
        rkey: "3jui7kd2zcszw",
        cid: "bafyreirepost",
        record: {
          subject: {
            uri: "at://did:plc:abc/app.musicsky.temp.song/3jui7kd2zcszw",
          },
        },
      } as never,
      db,
    );

    let rows = await db.selectFrom("repost").selectAll().execute();
    expect(rows).toHaveLength(1);

    await handleRepost(
      {
        action: "delete",
        did: "did:plc:reposter",
        collection: COLLECTIONS.repost,
        rkey: "3jui7kd2zcszw",
      } as never,
      db,
    );

    rows = await db.selectFrom("repost").selectAll().execute();
    expect(rows).toHaveLength(0);
  });
});
