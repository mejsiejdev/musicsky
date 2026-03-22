import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { DatabaseSchema } from "./schema.js";
import { config } from "../config.js";

let _db: Kysely<DatabaseSchema> | null = null;

export const getDb = (): Kysely<DatabaseSchema> => {
  if (!_db) {
    const sqlite = new Database(config.dbPath);
    sqlite.pragma("journal_mode = WAL");
    _db = new Kysely<DatabaseSchema>({
      dialect: new SqliteDialect({ database: sqlite }),
    });
  }
  return _db;
};
