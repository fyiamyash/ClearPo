import { randomUUID } from "bullmq";
import { db } from "../db/db";
import { invoice_events } from "../db/schema";
import type { invoiceEvent } from "./types";

export async function updateInvoiceEvents(
  status: invoiceEvent,
  invoiceId: string,
  actor: "SYSTEM" | "ADMIN",
) {
  await db.insert(invoice_events).values({
    invoiceId: invoiceId,
    type: status,
    actor: actor,
    createdAt: new Date(),
  });
  try {
  } catch (err) {
    console.error("Error while updating the Invoice event for: ", invoiceId);
    return;
  }
}
