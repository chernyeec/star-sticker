import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { mkdirSync } from "node:fs";
import * as schema from "./schema";

// PGlite is real Postgres compiled to WASM (not a different engine or a
// mock) — used here for dev/test so no external database account is
// needed. Production is designed to point at hosted Postgres (Neon)
// instead; swapping the driver here is the only change that requires.
//
// Migrations are applied separately via `npm run db:migrate` (see
// scripts/migrate.ts), not on import — running drizzle-orm's migrator
// inside Next.js's bundled server code hits a Turbopack path-resolution
// bug, and auto-migrating on every server start risks concurrent races
// in a serverless deployment anyway.
const dataDir = process.env.PGLITE_DATA_DIR ?? ".data/dev-db";
mkdirSync(dataDir, { recursive: true });

const client = new PGlite(dataDir);

export const db = drizzle(client, { schema });
