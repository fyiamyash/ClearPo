import { sleep } from "bun";
import { updateAgentLogs } from "../invoice/updateAgentLogs";
import { updateInvoiceEvents } from "../invoice/updateInvoiceEvents";
import { updateReconcile } from "../invoice/updateReconcile";
import { agentLoop } from "../LLM/agent/agentLoop";
import type { pdfExtractedDataType } from "../workers/pdf-extraction-worker";
import { deterministicFlow } from "./deterministicFlow";
import type { LlmResultType, reconciliationResult } from "./resultTypes";

export async function reconciliation(
  incomingDataFromPdfJob: pdfExtractedDataType,
  invoiceId: string,
) {
  const startedAt = new Date();
  let completedAt;
  const resulFromDeterministicFLow: reconciliationResult =
    await deterministicFlow(incomingDataFromPdfJob);
  await sleep(5000);
  updateInvoiceEvents("DETERMINISTIC_RECONCILIATION_COMPLETED", invoiceId, "SYSTEM");
  console.log("result from deterministic flow:", resulFromDeterministicFLow);
  completedAt = new Date();
  if (resulFromDeterministicFLow.agent_call_required) {
    const resultFromAgent = await agentLoop(
      resulFromDeterministicFLow,
      incomingDataFromPdfJob,
      invoiceId,
    );
    completedAt = new Date();
    if (resultFromAgent) {
      const parsedResultFromAgent: LlmResultType = JSON.parse(resultFromAgent);
      const reconcileLog = await updateReconcile(
        invoiceId,
        startedAt,
        completedAt,
        parsedResultFromAgent.decision,
      );
      updateAgentLogs({
        invoiceId: invoiceId,
        startedAt: startedAt,
        completedAt: completedAt,
        result: parsedResultFromAgent.decision,
        reconcileId: reconcileLog!.id,
      });
      return parsedResultFromAgent;
    }
  }
  updateReconcile(invoiceId, startedAt, completedAt, resulFromDeterministicFLow.decision);
  const formattedDeterministicResul: LlmResultType = {
    poMatch: resulFromDeterministicFLow.poMatch,
    supplierMatch: resulFromDeterministicFLow.supplierMatch,
    itemMatch: resulFromDeterministicFLow.itemMatch,
    quantityMatch: resulFromDeterministicFLow.quantityMatch,
    lineItemUnitPrice: resulFromDeterministicFLow.lineItemUnitPrice,
    priceMatch: resulFromDeterministicFLow.priceMatch,
    recieptMatch: resulFromDeterministicFLow.recieptMatch,
    ispaid: resulFromDeterministicFLow.ispaid,
    reason: resulFromDeterministicFLow.reason,
    decision: resulFromDeterministicFLow.decision,
  };
  return formattedDeterministicResul;
}
