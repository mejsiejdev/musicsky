import { type Kysely, type Migration, Migrator } from "kysely";
import { getDb } from "./index.js";

export const migrations: Record<string, Migration> = {
  "001": {
    async up(db: Kysely<unknown>) {
      await db.schema
        .createTable("song")
        .addColumn("uri", "text", (col) => col.primaryKey())
        .addColumn("cid", "text", (col) => col.notNull())
        .addColumn("did", "text", (col) => col.notNull())
        .addColumn("rkey", "text", (col) => col.notNull())
        .addColumn("record", "text", (col) => col.notNull())
        .addColumn("indexed_at", "text", (col) => col.notNull())
        .addColumn("created_at", "text", (col) => col.notNull())
        .execute();

      await db.schema
        .createIndex("idx_song_created_at")
        .on("song")
        .column("created_at")
        .execute();

      await db.schema
        .createIndex("idx_song_did")
        .on("song")
        .column("did")
        .execute();

      await db.schema
        .createTable("identity")
        .addColumn("did", "text", (col) => col.primaryKey())
        .addColumn("handle", "text", (col) => col.notNull())
        .addColumn("pds", "text", (col) => col.notNull())
        .addColumn("status", "text", (col) => col.notNull().defaultTo("active"))
        .addColumn("updated_at", "text", (col) => col.notNull())
        .execute();

      await db.schema
        .createTable("like")
        .addColumn("uri", "text", (col) => col.primaryKey())
        .addColumn("did", "text", (col) => col.notNull())
        .addColumn("rkey", "text", (col) => col.notNull())
        .addColumn("subject_uri", "text", (col) => col.notNull())
        .addColumn("created_at", "text", (col) => col.notNull())
        .execute();

      await db.schema
        .createIndex("idx_like_subject")
        .on("like")
        .column("subject_uri")
        .execute();

      await db.schema
        .createIndex("idx_like_did_subject")
        .on("like")
        .columns(["did", "subject_uri"])
        .execute();

      await db.schema
        .createTable("repost")
        .addColumn("uri", "text", (col) => col.primaryKey())
        .addColumn("did", "text", (col) => col.notNull())
        .addColumn("rkey", "text", (col) => col.notNull())
        .addColumn("subject_uri", "text", (col) => col.notNull())
        .addColumn("created_at", "text", (col) => col.notNull())
        .execute();

      await db.schema
        .createIndex("idx_repost_subject")
        .on("repost")
        .column("subject_uri")
        .execute();

      await db.schema
        .createIndex("idx_repost_did_subject")
        .on("repost")
        .columns(["did", "subject_uri"])
        .execute();
    },

    async down(db: Kysely<unknown>) {
      await db.schema.dropTable("repost").execute();
      await db.schema.dropTable("like").execute();
      await db.schema.dropTable("identity").execute();
      await db.schema.dropTable("song").execute();
    },
  },

  "002": {
    async up(db: Kysely<unknown>) {
      await db.schema
        .createTable("comment")
        .addColumn("uri", "text", (col) => col.primaryKey())
        .addColumn("did", "text", (col) => col.notNull())
        .addColumn("rkey", "text", (col) => col.notNull())
        .addColumn("subject_uri", "text", (col) => col.notNull())
        .addColumn("parent_uri", "text", (col) => col.notNull())
        .addColumn("text", "text", (col) => col.notNull())
        .addColumn("created_at", "text", (col) => col.notNull())
        .execute();

      await db.schema
        .createIndex("idx_comment_subject")
        .on("comment")
        .column("subject_uri")
        .execute();

      await db.schema
        .createIndex("idx_comment_did_subject")
        .on("comment")
        .columns(["did", "subject_uri"])
        .execute();
    },

    async down(db: Kysely<unknown>) {
      await db.schema.dropTable("comment").execute();
    },
  },

  "003": {
    async up(db: Kysely<unknown>) {
      await db.schema
        .alterTable("comment")
        .addColumn("cid", "text", (col) => col.notNull().defaultTo(""))
        .execute();
    },

    async down(db: Kysely<unknown>) {
      await db.schema.alterTable("comment").dropColumn("cid").execute();
    },
  },
};

export function getMigrator() {
  const db = getDb();
  return new Migrator({
    db,
    provider: {
      getMigrations: async () => migrations,
    },
  });
}
