import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { mkdirSync } from "node:fs";
import * as schema from "./schema";

// Migrations are applied separately via `npm run db:migrate` (see
// scripts/migrate.ts), not on import — running drizzle-orm's migrator
// inside Next.js's bundled server code hits a Turbopack path-resolution
// bug, and auto-migrating on every server start risks concurrent races
// in a serverless deployment anyway.
const dataDir = process.env.PGLITE_DATA_DIR ?? ".data/dev-db";
mkdirSync(dataDir, { recursive: true });

const client = new PGlite(dataDir);

export const db = drizzle(client, { schema });
