import { db } from "../db/db";
import { invoiceTable } from "../db/schema";

export async function updateInvoiceTable(
  status:
    | "RECEIVED"
    | "RECONCILING"
    | "REVIEW_REQUIRED"
    | "READY_FOR_PAYMENT"
    | "PAID"
    | "BLOCKED"
    | "FAILED",
) {
  await db.update(invoiceTable).set({
    status: status,
  });
}
