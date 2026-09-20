import {
  date,
  uuid,
  integer,
  pgEnum,
  pgTable,
  varchar,
  timestamp,
  decimal,
} from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status_Enum", [
  "RECEIVED",
  "EXTRACTING",
  "RECONCILING",
  "REVIEW_REQUIRED",
  "READY_FOR_PAYMENT",
  "PAYMENT_PROCESSING",
  "PAID",
  "BLOCKED",
  "FAILED",
]);
export const invoiceTable = pgTable("Invoice", {
  id: uuid().primaryKey().notNull(),
  location: varchar().notNull(),
  filename: varchar().notNull(),
  supplier_Email: varchar(),
  supplier_name: varchar(),
  invoice_number: varchar(),
  total_amount: integer(),
  purchase_order: varchar(),
  status: statusEnum(),
  createdAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const lineItems = pgTable("LineItems", {
  id: uuid().notNull().primaryKey(),
  invoiceId: uuid()
    .notNull()
    .references(() => invoiceTable.id),
  product: varchar().notNull(),
  quantity: integer().notNull(),
  unit_price: decimal({ precision: 12, scale: 2 }).notNull(),
  total_amount: decimal({ precision: 12, scale: 2 }),
});

export const actorEnum = pgEnum("actor", ["SYSTEM", "ADMIN"]);

export const invoice_events = pgTable("Invoice_Events", {
  id: integer().primaryKey(),
  invoiceId: uuid().references(() => invoiceTable.id),
  type: varchar(),
  actor: actorEnum(),
  createdAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const humanReview = pgTable("Human_Review", {
  id: uuid().primaryKey(),
  invoiceId: uuid()
    .notNull()
    .references(() => invoiceTable.id),
  decision: varchar().notNull(),
  reviewer: varchar(),
  reason: varchar(),
  createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  resolvedAt: timestamp({ withTimezone: true, mode: "date" }).notNull(),
});

export const reconcileTable = pgTable("Reconcile", {
  id: uuid().primaryKey(),
  invoiceId: uuid().references(() => invoiceTable.id),
  result: varchar(),
  startedAt: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  completedAt: timestamp({ withTimezone: true, mode: "date" }).notNull(),
});

export const agentTable = pgTable("AgentRun", {
  id: uuid().primaryKey(),
  invoiceId: uuid().references(() => invoiceTable.id),
  reconcileId: uuid().references(() => reconcileTable.id),
  startedAt: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  completedAt: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  result: varchar(),
});
