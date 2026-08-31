import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import { runMigrations } from "./migrate";

export async function createTestDb() {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await runMigrations(db);
  return db;
}

export type TestDb = Awaited<ReturnType<typeof createTestDb>>;
