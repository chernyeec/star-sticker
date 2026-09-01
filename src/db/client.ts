import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { PGlite } from "@electric-sql/pglite";
import { neon } from "@neondatabase/serverless";
import { mkdirSync } from "node:fs";
import * as schema from "./schema";

// Production points DATABASE_URL at Neon (real hosted Postgres); dev/test
// use PGlite (Postgres compiled to WASM, embedded — not a mock) so no
// external account is needed there. Neon's HTTP driver is stateless
// per-query (no interactive transactions), which is fine since nothing
// in this codebase uses db.transaction().
//
// The Neon branch's return type is cast to PgliteDatabase's shape: both
// drivers expose the same Drizzle query-builder surface (.select,
// .insert, .update, .delete, .query.*) via the shared pg-core base, and
// every module in this codebase types its `Db` param as `typeof db` --
// picking one concrete type here keeps that working across both drivers
// without touching every call site.
//
// Migrations are applied separately via `npm run db:migrate` (see
// scripts/migrate.ts), not on import — running drizzle-orm's migrator
// inside Next.js's bundled server code hits a Turbopack path-resolution
// bug, and auto-migrating on every server start risks concurrent races
// in a serverless deployment anyway.
function createDb(): PgliteDatabase<typeof schema> {
  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    return drizzleNeon(sql, { schema }) as unknown as PgliteDatabase<typeof schema>;
  }

  const dataDir = process.env.PGLITE_DATA_DIR ?? ".data/dev-db";
  mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  return drizzlePglite(client, { schema });
}

export const db = createDb();
