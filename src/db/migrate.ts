import { migrate } from "drizzle-orm/pglite/migrator";
import type { PgliteDatabase } from "drizzle-orm/pglite";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runMigrations(db: PgliteDatabase<any>) {
  await migrate(db, { migrationsFolder: "./drizzle" });
}
