import { pgTable, text, integer, timestamp, uuid, pgEnum, bigserial } from "drizzle-orm/pg-core";

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
export type PersonType = (typeof personTypeEnum.enumValues)[number];

export const session = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(),
  personType: personTypeEnum("person_type").notNull(),
  personId: uuid("person_id").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const starLedgerEntry = pgTable("star_ledger_entry", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Monotonic insertion order, for stable history ordering — wall-clock
  // createdAt can tie between two rapid inserts.
  sequence: bigserial("sequence", { mode: "number" }).notNull(),
  kidId: uuid("kid_id")
    .notNull()
    .references(() => kid.id),
  amount: integer("amount").notNull(),
  reason: text("reason"),
  createdByParentId: uuid("created_by_parent_id")
    .notNull()
    .references(() => parent.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reward = pgTable("reward", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id")
    .notNull()
    .references(() => family.id),
  name: text("name").notNull(),
  cost: integer("cost").notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

export const redemptionStatusEnum = pgEnum("redemption_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);
export type RedemptionStatus = (typeof redemptionStatusEnum.enumValues)[number];

export const redemption = pgTable("redemption", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Monotonic insertion order, for stable history ordering — see the
  // same field on star_ledger_entry for why.
  sequence: bigserial("sequence", { mode: "number" }).notNull(),
  kidId: uuid("kid_id")
    .notNull()
    .references(() => kid.id),
  rewardNameSnapshot: text("reward_name_snapshot").notNull(),
  rewardCostSnapshot: integer("reward_cost_snapshot").notNull(),
  status: redemptionStatusEnum("status").notNull().default("pending"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolvedByParentId: uuid("resolved_by_parent_id").references(() => parent.id),
  rejectReason: text("reject_reason"),
});
