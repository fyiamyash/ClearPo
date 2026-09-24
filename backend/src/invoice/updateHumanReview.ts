import { db } from "../db/db";
import { humanReview } from "../db/schema";
import type { humanReviewType } from "./types";

export async function updateReviewTable(incomingData: humanReviewType) {
  try {
    await db.insert(humanReview).values({
      invoiceId: incomingData.invoiceId,
      reason: incomingData.reason,
      decision: incomingData.decision,
      reviewer: incomingData.reviewer,
      createdAt: incomingData.createdAt,
      resolvedAt: incomingData.resolvedAt,
    });
  } catch (err) {
    console.log("error while iserting the data into updateReviewTable", err);
    return;
  }
}
