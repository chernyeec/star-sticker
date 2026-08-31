import { pgTable, text, integer, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";

export const family = pgTable("family", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
});

export const parent = pgTable("parent", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id")
    .notNull()
    .references(() => family.id),
  name: text("name").notNull(),
  avatar: text("avatar"),
  pinHash: text("pin_hash").notNull(),
  failedPinAttempts: integer("failed_pin_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
});

export const kid = pgTable("kid", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id")
    .notNull()
    .references(() => family.id),
  name: text("name").notNull(),
  avatar: text("avatar"),
  pinHash: text("pin_hash").notNull(),
  failedPinAttempts: integer("failed_pin_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
});

export const personTypeEnum = pgEnum("person_type", ["parent", "kid"]);

export const session = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(),
  personType: personTypeEnum("person_type").notNull(),
  personId: uuid("person_id").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
