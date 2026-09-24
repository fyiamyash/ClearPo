import { db } from "../db/db";
import { agentTable } from "../db/schema";
import type { agentTableType } from "./types";

export async function updateAgentLogs(incomingData: agentTableType) {
  try {
    await db.insert(agentTable).values({
      invoiceId: incomingData.invoiceId,
      reconcileId: incomingData.reconcileId,
      result: incomingData.result,
      startedAt: incomingData.startedAt,
      completedAt: incomingData.completedAt,
    });
  } catch (err) {
    console.error("Error while inserting data in agentTable!", err);
    return;
  }
}
