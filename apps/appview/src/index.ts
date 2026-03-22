import express from "express";
import { getMigrator } from "./db/migrations.js";
import { getDb } from "./db/index.js";
import { createIdentityResolver } from "./identity/resolver.js";
import { createTapConsumer } from "./tap/consumer.js";
import { registerRoutes } from "./routes/index.js";
import { config } from "./config.js";

async function main() {
  // Run migrations
  const migrator = getMigrator();
  const { error, results } = await migrator.migrateToLatest();
  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`Migration "${it.migrationName}" executed successfully`);
    } else if (it.status === "Error") {
      console.error(`Failed to execute migration "${it.migrationName}"`);
    }
  });
  if (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  const db = getDb();
  const resolver = createIdentityResolver(db);

  // Start Tap consumer
  createTapConsumer({
    db,
    resolver,
    tapUrl: config.tapUrl,
    tapAdminPassword: config.tapAdminPassword,
  }).start();

  // Start Express server
  const app = express();
  app.use(express.json());
  registerRoutes(app, resolver);

  app.listen(config.port, () => {
    console.log(`AppView listening on port ${config.port}`);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
