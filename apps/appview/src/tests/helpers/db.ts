import Database from "better-sqlite3";
import { Kysely, Migrator, SqliteDialect } from "kysely";
import type { DatabaseSchema } from "../../db/schema.js";
import { migrations } from "../../db/migrations.js";

export async function createTestDb(): Promise<Kysely<DatabaseSchema>> {
  const db = new Kysely<DatabaseSchema>({
    dialect: new SqliteDialect({ database: new Database(":memory:") }),
  });

  const migrator = new Migrator({
    db,
    provider: { getMigrations: async () => migrations },
  });

  const { error } = await migrator.migrateToLatest();
  if (error) throw error;

  return db;
}
