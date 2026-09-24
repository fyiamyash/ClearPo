import { db } from "../db/db";
import { reconcileTable } from "../db/schema";

export async function updateReconcile(
  invoiceId: string,
  startedAt: Date,
  finishedAt: Date,
  decision: string,
) {
  try {
    await db.insert(reconcileTable).values({
      invoiceId: invoiceId,
      result: decision,
      startedAt: startedAt,
      completedAt: finishedAt,
    });
  } catch (err) {
    console.error("Error while inserting entry for Reconciliation process", err);
    return;
  }
}
