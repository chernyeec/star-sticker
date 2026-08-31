import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { mkdirSync } from "node:fs";
import { runMigrations } from "../src/db/migrate";

const dataDir = process.env.PGLITE_DATA_DIR ?? ".data/dev-db";
mkdirSync(dataDir, { recursive: true });

async function main() {
  const client = new PGlite(dataDir);
  const db = drizzle(client);

  await runMigrations(db);
  await client.close();

  console.log(`Migrations applied to ${dataDir}`);
}

main();
