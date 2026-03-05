import { getMigrator } from "@/lib/db/migrations";

async function main() {
  const migrator = getMigrator();
  const { error } = await migrator.migrateToLatest();
  if (error) throw error;
  // eslint-disable-next-line no-console
  console.log("Migrations complete.");
}

main();
