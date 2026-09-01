import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { migrate as migrateNeon } from "drizzle-orm/neon-http/migrator";
import { PGlite } from "@electric-sql/pglite";
import { neon } from "@neondatabase/serverless";
import { mkdirSync } from "node:fs";
import { runMigrations } from "../src/db/migrate";

async function main() {
  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzleNeon(sql);
    await migrateNeon(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied to Neon (DATABASE_URL)");
    return;
  }

  const dataDir = process.env.PGLITE_DATA_DIR ?? ".data/dev-db";
  mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  const db = drizzlePglite(client);

  await runMigrations(db);
  await client.close();

  console.log(`Migrations applied to ${dataDir}`);
}

main();
